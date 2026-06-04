import pandas as pd


def prepare_features(file_path):

    df = pd.read_csv(file_path)

    threat_mapping = {
        "DDoS": 1,
        "Malware": 2,
        "Brute Force": 3
    }

    source_mapping = {
        "IDS": 1,
        "Firewall": 2,
        "WAF": 3
    }

    severity_mapping = {
        "Low": 0,
        "Medium": 1,
        "High": 2
    }

    df["threat_type_encoded"] = (
        df["threat_type"].map(threat_mapping)
    )

    df["source_encoded"] = (
        df["source"].map(source_mapping)
    )

    df["severity_encoded"] = (
        df["severity"].map(severity_mapping)
    )

    df.to_csv(
        "ml_ready_dataset.csv",
        index=False
    )

    return {
        "rows": len(df),
        "file": "ml_ready_dataset.csv"
    }