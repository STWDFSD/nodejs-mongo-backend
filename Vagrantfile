# -*- mode: ruby -*-
# vi: set ft=ruby :

# The ports on the host that you want to use to access the port on the guest.
# This must be greater than port 1024.
MONGODB_PORT=27017
HTTP_SERVER_PORT=8080

APP_HOME_DIR="/var/www/app"
Vagrant.configure(2) do |config|

  config.vm.box = "ubuntu/bionic64"

  config.vm.provider "virtualbox" do |vb|
     vb.name = "mongo_nodejs_vm"
     vb.memory = "1024"
   end

  config.vm.network "forwarded_port", guest: 8080, host: HTTP_SERVER_PORT, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 27017, host: MONGODB_PORT, host_ip: "127.0.0.1"

  config.vm.synced_folder "./app/", APP_HOME_DIR, create: true,  type: "rsync",
     rsync__exclude: ['.git/', 'node_modules/', '.vagrant/']

  config.vm.provision "shell", path: "vagrant/provision.sh", privileged: false

  config.vm.provision "shell", inline: "echo Back-end server configuration complete!"
end
