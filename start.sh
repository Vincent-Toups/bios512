#!/bin/bash
# start.sh - rebuild and run JupyterLab container with R + Python

IMAGE_NAME=jupyter-r-ds

# Build the image
podman build -t $IMAGE_NAME .

# Run the container
podman run -it --rm \
    --network=host \
    -v "$(pwd)":/project \
    $IMAGE_NAME
