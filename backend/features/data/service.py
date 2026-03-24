from sqlalchemy.orm import Session
from fastapi import HTTPException

from features.data.schema import AddData
from .data_model import Data
from features.auth.model import User

def create_data(db: Session, data: AddData, current_user: User):
    
    # Use dict access instead of dot access
    instructor_id = current_user["instructor_id"]

    # Check for duplicate DataId
    existing = db.query(Data).filter(
        Data.DataId == data.DataId,
        Data.instructor_id == instructor_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="DataId already exists for this instructor"
        )
    
    # ✅ Create new record
    db_data = Data(
        DataId=data.DataId,
        instructor_id=instructor_id,
        Values=str(data.Values),  # or JSON if you changed column type
        Min=data.Min,
        Max=data.Max,
        Class_interval=data.Class_interval,
        FileName=data.FileName,
        FileType=data.FileType,
        Date=data.Date,
        Time=data.Time
    )

    db.add(db_data)
    db.commit()
    db.refresh(db_data)

    return db_data

# -------------------------------
# Helper: Generate textbook intervals
# -------------------------------
def generate_textbook_intervals(values, class_interval, min_value, max_value):
    """
    Generate intervals and boundaries in textbook style:
    - Evenly spaced: 0-10, 10-20, 20-30, 30-40
    - Uneven spaced: apply ±0.5 boundaries
    """
    min_val, max_val = min(values), max(values)

    # Start at nearest lower multiple of class_interval
    start = (min_val // class_interval) * class_interval
    # Ensure last interval covers max_val
    end_limit = ((max_val // class_interval) + 1) * class_interval

    intervals, boundaries, widths = [], [], []

    evenly_spaced = start % class_interval == 0

    current = start
    while current < end_limit:
        # Upper bound includes the next multiple of class_interval
        interval_end = current + class_interval
        intervals.append(f"{current}-{interval_end}")

        # Boundaries
        if evenly_spaced:
            boundaries.append(f"{current}-{interval_end}")
        else:
            boundaries.append(f"{current - 0.5}-{interval_end + 0.5}")

        widths.append(class_interval)
        current += class_interval

    return intervals, boundaries, widths

# -------------------------------
# Frequencies, midpoints, fixi
# -------------------------------
def calculate_frequencies(values, intervals):
    frequencies, midpoints, fixis = [], [], []
    for i, interval in enumerate(intervals):
        start, end = map(int, interval.split('-'))
        if i == len(intervals) - 1:
            # Last interval includes the max value
            f = sum(start <= v <= end for v in values)
        else:
            # Upper bound exclusive
            f = sum(start <= v < end for v in values)
        xi = (start + end) / 2
        frequencies.append(f)
        midpoints.append(xi)
        fixis.append(f * xi)
    return frequencies, midpoints, fixis


# -------------------------------
# Cumulative frequency
# -------------------------------
def calculate_cumulative(frequencies):
    cumulative = []
    total = 0
    for f in frequencies:
        total += f
        cumulative.append(total)
    return cumulative


# -------------------------------
# Mean
# -------------------------------
def calculate_mean(fixis, total_frequencies):
    return sum(fixis) / total_frequencies if total_frequencies else 0


# -------------------------------
# Median
# -------------------------------
def calculate_median(intervals, frequencies, cumulative_frequencies, total_frequencies, class_interval):
    N = total_frequencies
    median_class_index = next((i for i, cf in enumerate(cumulative_frequencies) if cf >= N / 2), None)
    if median_class_index is None:
        return 0
    cf_prev = cumulative_frequencies[median_class_index - 1] if median_class_index > 0 else 0
    L = float(intervals[median_class_index].split('-')[0])
    f = frequencies[median_class_index]
    return L + ((N / 2 - cf_prev) / f) * class_interval if f else 0


# -------------------------------
# Mode
# -------------------------------
def calculate_mode(intervals, frequencies, class_interval):
    max_index = frequencies.index(max(frequencies))
    f1 = frequencies[max_index]
    f0 = frequencies[max_index - 1] if max_index > 0 else 0
    f2 = frequencies[max_index + 1] if max_index < len(frequencies) - 1 else 0
    L = float(intervals[max_index].split('-')[0])
    return L + ((f1 - f0) / (2 * f1 - f0 - f2)) * class_interval if (2 * f1 - f0 - f2) != 0 else L


# -------------------------------
# Main processor function
# -------------------------------
def process_data(values, class_interval, min_value, max_value):

    # -------------------------------
    # Step 0: Filter values using Min and Max
    # -------------------------------
    filtered_values = [
        v for v in values
        if min_value <= v <= max_value
    ]

    if not filtered_values:
        raise HTTPException(
            status_code=400,
            detail="No values found within the specified Min and Max range"
        )

    filtered_values.sort()

    # Step 1: Intervals & boundaries
    intervals, boundaries, widths = generate_textbook_intervals(
        filtered_values,
        class_interval,
        min_value,
        max_value
    )

    # Step 2: Frequencies, midpoints, fixi
    frequencies, midpoints, fixis = calculate_frequencies(
        filtered_values,
        intervals
    )

    # Step 3: Cumulative frequency
    cumulative_frequencies = calculate_cumulative(frequencies)

    # Step 4: Total frequencies
    total_frequencies = sum(frequencies)

    # Step 5: Mean, Median, Mode
    mean = calculate_mean(fixis, total_frequencies)

    median = calculate_median(
        intervals,
        frequencies,
        cumulative_frequencies,
        total_frequencies,
        class_interval
    )

    mode = calculate_mode(
        intervals,
        frequencies,
        class_interval
    )

    return {
        "title": "Group Data",
        "mean": round(mean, 2),
        "median": round(median, 2),
        "mode": round(mode, 2),
        "filtered_count": len(filtered_values),
        "table": [
            {"interval": intervals},
            {"boundaries": boundaries},
            {"width": widths},
            {"f": frequencies},
            {"xi": midpoints},
            {"fixi": fixis},
            {"cf": cumulative_frequencies}
        ]
    }