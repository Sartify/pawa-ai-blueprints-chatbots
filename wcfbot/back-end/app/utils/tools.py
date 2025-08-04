from datetime import datetime

def get_current_datetime(date_format: str = "%Y-%m-%d %H:%M:%S") -> dict:
    """
    Returns the current date and time in the specified format.
    
    Args:
        date_format (str): The format string for the date and time. Defaults to '%Y-%m-%d %H:%M:%S'.
    
    Returns:
        dict: A dictionary containing the formatted datetime string.
    """
    now = datetime.now()
    try:
        formatted_datetime = now.strftime(date_format)
        return {
            "formatted_datetime": formatted_datetime,
            "iso_datetime": now.isoformat()
        }
    except ValueError as e:
        return {
            "error": f"Invalid date format: {str(e)}",
            "iso_datetime": now.isoformat()
        }