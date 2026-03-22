import numpy as np
import statistics
from collections import Counter
from .dto_ungroup import SampleRequestDTO

class UngroupedService:
    @staticmethod
    def calculate_statistics(data: list[float]):
        # --- KEEPING YOUR EXACT LOGIC ---
        if not data:
            return {"error": "No data provided"}

        sorted_data = sorted(data)
        mean_val = sum(sorted_data) / len(sorted_data)
        mode_val = statistics.multimode(sorted_data)
        median_val = statistics.median(sorted_data)
        freq_table = dict(Counter(sorted_data))
        
        return {
            "mean": round(mean_val, 2),
            "mode": mode_val,
            "median": median_val,
            "frequency_table": freq_table,
            "sorted_dataset": sorted_data
        }

class SampleService:
    @staticmethod
    def process_data(data: SampleRequestDTO, user_id: int):
        # 1. Filter and Sort logic
        arr = np.array(data.values)
        filtered = arr[(arr >= data.min) & (arr <= data.max)]
        filtered_sorted = np.sort(filtered).tolist() # Convert numpy to standard list

        # 2. PASS the filtered_sorted data to the other service
        stats = UngroupedService.calculate_statistics(filtered_sorted)

        return {
            "Instructor_ID": user_id,  
            "message": "Processed successfully",
            "filtered_values": filtered_sorted,
            "statistics": stats # Returning the combined results
        }