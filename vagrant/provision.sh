#!/bin/bash

VAGRANT_DIR=/vagrant/vagrant
HOME_DIR=~/
HOME_BIN_DIR=$HOME_DIR/bin
APP_HOME_DIR=/var/www/app
MONGO_VERSION=$1
MONGO_COMPONENT_VERSION=$2

installPackage()
{
    local packages=$*
    echo "Installing $packages"
    sudo apt-get install -y $packages >/dev/null 2>&1
}

updatePackages()
{
    sudo add-apt-repository ppa:openjdk-r/ppa -y >/dev/null 2>&1
    sudo apt-get update >/dev/null 2>&1
}

installPackages()
{
    updatePackages
    installPackage git
    installPackage zip
    installPackage unzip
    installPackage make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev
}

createAndMoveToHomeBinDir()
{
    echo "Creating and moving to bin directory"
    mkdir $HOME_BIN_DIR
    cd $HOME_BIN_DIR
}

installMongo()
{
    VERSION=$1
    COMPONENT_VERSION=$2
    echo "Installing mongodb ${COMPONENT_VERSION}"
    sudo apt-get install gnupg
    wget -qO - "https://www.mongodb.org/static/pgp/server-${VERSION}.asc" | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/${VERSION} multiverse" | sudo tee "/etc/apt/sources.list.d/mongodb-org-${VERSION}.list" >/dev/null 2>&1
    sudo apt-get update
    mongo_packages=("mongodb-org=${COMPONENT_VERSION}" "mongodb-org-server=${COMPONENT_VERSION}" "mongodb-org-shell=${COMPONENT_VERSION}" "mongodb-org-mongos=${COMPONENT_VERSION}" "mongodb-org-tools=${COMPONENT_VERSION}"  mongodb-mongosh)
    sudo apt-get install -y "${mongo_packages[@]}"

    echo "mongodb-org hold" | sudo dpkg --set-selections
    echo "mongodb-org-server hold" | sudo dpkg --set-selections
    echo "mongodb-org-shell hold" | sudo dpkg --set-selections
    echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
    echo "mongodb-org-tools hold" | sudo dpkg --set-selections
}

initReplicateDB()
{
    sudo mkdir -p /mongodb/logs/
    sudo mkdir -p /mongodb/data
    sudo touch /mongodb/logs/mongod.log
    sudo chown mongodb:mongodb -R /mongodb/

    sudo mv /etc/mongod.conf /etc/mongod.conf.bk
    sudo cp $VAGRANT_DIR/mongod.conf /etc/mongod.conf

    sudo systemctl enable mongod.service
    sudo systemctl start mongod

    sleep 5 && mongosh --quiet <<EOF

    rs.initiate();
    exit;
EOF

    sleep 5 && mongoimport --db test --collection grades --drop --file $VAGRANT_DIR/grades.json &>/dev/null

    echo "Database Replica initialized"
}

installNode()
{
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

    nvm install node

    # echo 'npm set prefix $HOME/.npm' >> $HOME/.bashrc
    # echo 'export PATH=$HOME/.npm/bin:$PATH' >> $HOME/.bashrc
    # echo 'export PATH=./node_modules/.bin:$PATH' >> $HOME/.bashrc
    source $HOME/.bashrc

    # PM2 makes it possible to daemonize applications so that they will run in the background as a service
    npm install pm2@latest -g

    cd $APP_HOME_DIR
    npm install express
    npm install babel-polyfill
    npm install mongodb
    npm install devextreme-query-mongodb
    npm install cors
    npm install morgan
    npm install mongoose


    # Applications that are running under PM2 will be restarted automatically if the application
    # crashes or is killed, but we can take an additional step to get the application to
    # launch on system startup using the startup subcommand. This subcommand generates and
    # configures a startup script to launch PM2 and its managed processes on server boots
    #
    # Other useful commands are:
    # pm2 stop app_name_or_id
    # pm2 restart app_name_or_id
    # pm2 list
    # pm2 info app_name
    # pm2 monit
    pm2 kill

    pm2 startup systemd
    sudo env PATH=$PATH:/home/vagrant/.nvm/versions/node/$(nvm current)/bin /home/vagrant/.nvm/versions/node/$(nvm current)/lib/node_modules/pm2/bin/pm2 startup systemd -u vagrant --hp /home/vagrant

    # You have now created a systemd unit that runs pm2 for your user on boot.
    # This pm2 instance, in turn, runs your application
    sudo systemctl start pm2-vagrant

    # your application in the background
    pm2 start $APP_HOME_DIR/app.js

    # save the PM2 process list and corresponding environments
    pm2 save
}

provision()
{
    createAndMoveToHomeBinDir
    installPackages
    installMongo "$MONGO_VERSION" "$MONGO_COMPONENT_VERSION"
    initReplicateDB
    installNode
}

if [ ! -f "/var/vagrant_provision" ]; then
    sudo touch /var/vagrant_provision
    provision
else
    echo "Machine already provisioned. Run 'vagrant destroy' and 'vagrant up' to re-create."
fi
