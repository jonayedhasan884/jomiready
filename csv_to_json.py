
import csv
import json
from pathlib import Path

input_file = Path("src/data/mouzas.csv")
output_file = Path("src/data/mouzas.json")

if not input_file.exists():
    raise FileNotFoundError(f"CSV file not found: {input_file}")

with input_file.open("r", encoding="utf-8-sig", newline="") as file:
    # Skip empty lines before the header
    non_empty_lines = (line for line in file if line.strip())
    reader = csv.DictReader(non_empty_lines)

    if not reader.fieldnames:
        raise ValueError("CSV file is empty or has no header.")

    # Remove accidental spaces from column names
    reader.fieldnames = [name.strip() for name in reader.fieldnames]

    required = [
        "sl", "division", "district", "upazila",
        "mouza_name", "jl_number", "area_acre", "area_shatak"
    ]

    missing = [name for name in required if name not in reader.fieldnames]
    if missing:
        raise ValueError(
            f"Missing CSV columns: {missing}. "
            f"Found columns: {reader.fieldnames}"
        )

    records = []

    for line_number, row in enumerate(reader, start=2):
        try:
            records.append({
                "sl": int(row["sl"].strip()),
                "division": row["division"].strip(),
                "district": row["district"].strip(),
                "upazila": row["upazila"].strip(),
                "mouza_name": row["mouza_name"].strip(),
                "jl_number": row["jl_number"].strip(),
                "area_acre": float(row["area_acre"]),
                "area_shatak": float(row["area_shatak"]),
                "verification_status": "unverified",
                "source_url": ""
            })
        except (ValueError, AttributeError) as error:
            raise ValueError(
                f"Invalid data near CSV line {line_number}: {row}"
            ) from error

output_file.parent.mkdir(parents=True, exist_ok=True)

with output_file.open("w", encoding="utf-8") as file:
    json.dump(records, file, ensure_ascii=False, indent=2)

print(f"Conversion complete: {len(records)} records")
print(f"Output: {output_file}")

