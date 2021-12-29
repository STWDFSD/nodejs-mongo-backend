# -*- mode: ruby -*-
# vi: set ft=ruby :

APP_HOME_DIR="/var/www/app"
Vagrant.configure(2) do |config|

  config.vm.box = "ubuntu/bionic64"

  config.vm.provider "virtualbox" do |vb|
     vb.name = "mongo_nodejs_vm"
     vb.memory = "1024"
   end

  config.vm.network "forwarded_port", guest: 8080, host: 8080, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 27017, host: 27017, host_ip: "127.0.0.1"

  config.vm.synced_folder "./app/", APP_HOME_DIR, create: true,  type: "rsync",
     rsync__exclude: ['.git/', 'node_modules/', '.vagrant/']

  config.vm.provision "shell", path: "vagrant/provision.sh", privileged: false

  config.vm.provision "shell", inline: "echo Back-end server configuration complete!"
end
