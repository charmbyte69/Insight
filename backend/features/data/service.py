from sqlalchemy.orm import Session
from fastapi import HTTPException

from features.data.schema import AddData
from .data_model import Data
from features.auth.model import User

def create_data(db: Session, data: AddData, current_user: User):
    
    # 🔍 Optional: prevent duplicate DataId per instructor
    existing = db.query(Data).filter(
        Data.DataId == data.DataId,
        Data.instructor_id == current_user.instructor_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="DataId already exists for this instructor"
        )
    
    # ✅ Create new record
    db_data = Data(
        DataId=data.DataId,
        instructor_id=current_user.instructor_id,
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

def process_data(values, class_interval):
    values.sort()

    min_val = min(values)
    max_val = max(values)
    data_range = max_val - min_val

    start = (min_val // class_interval) * class_interval

    intervals = []
    while start <= max_val:
        end = start + class_interval
        intervals.append((start, end))
        start += class_interval

    table = []
    cf = 0
    total_f = 0
    total_fixi = 0

    for low, high in intervals:
        # ✅ FIX: no overlap
        f = sum(low <= v < high for v in values)

        xi = (low + high) / 2
        fixi = f * xi
        cf += f

        total_f += f
        total_fixi += fixi

        table.append({
            "interval": f"{int(low)}-{int(high)}",
            "f": f,
            "xi": xi,
            "fixi": fixi,
            "cf": cf
        })

    mean = total_fixi / total_f if total_f else 0

    # Median
    N = total_f
    median_class = next((row for row in table if row["cf"] >= N/2), None)

    if median_class:
        idx = table.index(median_class)
        cf_prev = table[idx - 1]["cf"] if idx > 0 else 0
        L = intervals[idx][0]
        f = median_class["f"]
        i = class_interval

        median = L + ((N/2 - cf_prev) / f) * i if f else 0
    else:
        median = 0

    # Mode
    freqs = [row["f"] for row in table]
    max_index = freqs.index(max(freqs))

    f1 = freqs[max_index]
    f0 = freqs[max_index - 1] if max_index > 0 else 0
    f2 = freqs[max_index + 1] if max_index < len(freqs) - 1 else 0

    L = intervals[max_index][0]
    i = class_interval

    if (2*f1 - f0 - f2) != 0:
        mode = L + ((f1 - f0) / (2*f1 - f0 - f2)) * i
    else:
        mode = 0

    return {
        "range": data_range,
        "mean": round(mean, 2),
        "median": round(median, 2),
        "mode": round(mode, 2),
        "table": table
    }