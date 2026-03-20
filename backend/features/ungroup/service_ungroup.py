from .dto_ungroup import SampleRequestDTO
import numpy as np

class SampleService:

    @staticmethod
    def process_data(data: SampleRequestDTO, user_id: int):
        # Convert list to numpy array
        arr = np.array(data.values)

        # Filter values within range
        filtered = arr[(arr >= data.min) & (arr <= data.max)]

        # Sort the filtered values
        filtered_sorted = np.sort(filtered)  # ascending order

        return {
            "Instructor_ID": user_id,  
            "message": "Processed successfully",
            "filtered_values": filtered_sorted
        }