## Running with Docker (optional)

1. Install docker for your platform

- macOS: https://docs.docker.com/docker-for-mac/install/#download-docker-for-mac
- Windows: https://docs.docker.com/docker-for-windows/install/#download-docker-for-windows

2. Build the cluster

`docker-compose -f docker/development.yml build`

3. Run the cluster

`docker-compose -f docker/development.yml up`

- Note: you can run detached `docker-compose -f docker/development.yml up -d` and view the console logs in Kitematic
