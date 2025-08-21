# Start from Ubuntu base
FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Python, pip, R, and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    gnupg \
    software-properties-common \
    r-base \
    r-base-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install JupyterLab and Jupytext
RUN pip3 install --no-cache-dir jupyterlab jupytext

# Install IRkernel and tidyverse in R
RUN R -e "install.packages(c('IRkernel','tidyverse'), repos='https://cloud.r-project.org/'); IRkernel::installspec(user = FALSE)"

# Expose Jupyter port
EXPOSE 8888

# Run JupyterLab as root
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--port=8888", "--allow-root", "--no-browser"]
