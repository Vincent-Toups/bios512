# What is an SSH Key Pair?

SSH Keys are handy little blobs of data. You have a public key, which
you can freely distribute to anyone for any reason, pretty much. And you
have a private key. Using your private key you can generate a message
which someone can use your public key to verify comes from you. You
don't need to share your private key to authenticate yourself.

On a unix-like shell (git bash also works) you generate an ssh key pair
like this:

(PS - DON'T do this in your git repository! Keep your ssh key private!)

``` bash
$ cd /tmp/
$ mkdir ssh-keys
$ cd ssh-keys/
$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/toups/.ssh/id_rsa): github_rsa_key
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in github_rsa_key
Your public key has been saved in github_rsa_key.pub
The key fingerprint is:
SHA256:OrCwHThgGEzWpSHmyqt4jdIOca31GZ51Q1n6bcFJW2c toups@7cdbeba530bb
The key's randomart image is:
+---[RSA 3072]----+
|+=....      . . E|
|=o..o      + o =.|
|oo .      +   =  |
|+. o     . . . . |
|o.= = . S o . o  |
| o.B * * . . .   |
|.oooo B          |
|+.+ .  .         |
|o+.              |
+----[SHA256]-----+
$  
```

This will generate two files. It is very important to understand that
the `.pub` file is the PUBLIC key. This is the key you can upload to
github. Never let anyone have a copy of your private key. Indeed, be
careful to avoid distributing it accidentally!

Now we can upload our key to github. First select "Settings":

![select settings](./settings.png)

Then "SSH and GPG Keys"

![keys](./ssh-keys-menu.png)

Then "New SSH Key"

![new ssh key](./new-ssh-key.png)

You can put anything you want for the title, but it's useful to put
something like "work laptop" that identifies where the associated
private key is stored. Then you will need to open the public key file
(in notepad, for instance) and copy it carefully into the text box.

Once you've completed this process you can finally go back to your
console.

``` bash
ssh-add /tmp/ssh-keys/github_rsa_key
git remote add origin git@github.com:Vincent-Toups/611-example.git
git push -u origin main  
```

``` bash
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Here we've informed our ssh-agent that we want to use the specified
private key and then we simply push. If we refresh our repo page we
should see our files and our README.

![Tada](./repo.png)


Next: ::git-conclusions:Conclusions::.
