from datetime import date, timedelta


def calculate_date():
    ress=(date(2026, 2, 26)- date.today()).days
    future_date = date.today() + timedelta(days=50)
    return ress,future_date
print(calculate_date())