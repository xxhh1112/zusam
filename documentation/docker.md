Use the Docker container
========================

Download the latest release (here in /srv/zusam):
```
mkdir -p /srv/zusam && cd /srv/zusam
wget -qO- https://github.com/nrobinaubertin/zusam/archive/0.1.1.tar.gz | tar xz --strip 1
```

Build the container:
```
sudo docker build -t zusam .
```

Start the container giving the path to the data directory as volume:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam zusam
```

The default first username is `zusam` with the password `zusam`.