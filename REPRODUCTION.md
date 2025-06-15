# Reproduction steps

### Prerequisites:
- Kubernetes 1.24+
- Helm 3.14+ 
- 6GBs of RAM 
- Python and Jupyter Notebooks

## 1. OpenTelemetry demo Setup

Add OpenTelemetry Helm repository:
```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Install the Helm chart:

```bash
helm install my-otel-demo open-telemetry/opentelemetry-demo \
  --namespace my-otel-demo \
  --create-namespace \
  --version 0.37.1
```

## 2. Trivy-Operator Setup
Add the Aqua chart repository:
```
helm repo add aqua https://aquasecurity.github.io/helm-charts/
helm repo update
```

Install the Helm Chart:

```bash
helm install trivy-operator aqua/trivy-operator \
     --namespace trivy-system \
     --create-namespace \
     --version 0.28.1
```

## 3. Jupyter Notebook Setup
Install the required Python packages and run jupyter notebook:
```shell
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
jupyter notebook measurements.ipynb
```


## 4. Generate measurement data
1. Wait for the Trivy Operator to finish scanning every Image.
2. Execute every cell in the notebook in chronological order 

This will create the following files:
- `data/vulnerabilityreports/*.yaml` - Raw vulnerability reports
- `data/otel_vulnerability_summary.csv` - Vulnerability counts per image
- `data/otel_vulnerabilities.csv` - List of found vulnerabilities with source type
- `data/otel_source_categorization.csv` - Vulnerability counts by source type
- `data/otel_unique_vulnerabilities.csv`- unique CVEs
- `data/otel_unique_vulnerability_severity_distribution.csv` - Number of unique CVE count per severity


If no graphical user interface is available, the notebook can be executed like this:
```shell
jupyter nbconvert --to notebook --execute measurements.ipynb
```

## Sources:

[OpenTelemetry demo Kubernetes deployment](https://opentelemetry.io/docs/demo/kubernetes-deployment/) (Accessed May 30 2025)
[Aqua Security](https://aquasecurity.github.io/trivy-operator/latest/) (Accessed May 30 2025)

