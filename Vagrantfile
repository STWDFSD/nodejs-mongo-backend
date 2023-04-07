# -*- mode: ruby -*-
# vi: set ft=ruby :

# The ports on the host that you want to use to access the port on the guest.
# This must be greater than port 1024.
MONGODB_PORT=27017
HTTP_SERVER_PORT=8080
MONGO_VERSION="5.0"              # 4.4
MONGO_COMPONENT_VERSION="5.0.15" # 4.4.19

APP_HOME_DIR="/var/www/app"
Vagrant.configure(2) do |config|

  config.vm.box = "ubuntu/bionic64"
  config.vm.boot_timeout = 120

  config.vm.provider "virtualbox" do |vb|
     vb.name = "mongo_nodejs_vm"
     vb.memory = "1024"
   end

  # This prevents vagrant checking kernel and guest-additions for subsequent
  # vagrant up command executions, reducing the vm startup time
  if not isProvisioned() then
    if Vagrant.has_plugin?("vagrant-vbguest") then
      config.vbguest.installer_options = { allow_kernel_upgrade: true }
      config.vbguest.auto_update = true
    else
      raise 'vagrant-vbguest is not installed! Please install vagrant-vbguest plugin!'
    end
  else
    config.vbguest.auto_update = false
  end

  config.vm.network "forwarded_port", guest: 8080, host: HTTP_SERVER_PORT, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 27017, host: MONGODB_PORT, host_ip: "127.0.0.1"

  config.vm.synced_folder "./app/", APP_HOME_DIR, create: true,  type: "rsync",
     rsync__exclude: ['.git/', 'node_modules/', '.vagrant/']

  config.vm.provision "shell", path: "vagrant/provision.sh", privileged: false,
    args: [MONGO_VERSION, MONGO_COMPONENT_VERSION]

  config.vm.provision "shell", inline: "echo Back-end server configuration complete!"
end

def isProvisioned(vm_name='default', provider='virtualbox')
  File.exists?(File.join(File.dirname(__FILE__),".vagrant/machines/#{vm_name}/#{provider}/action_provision"))
end
