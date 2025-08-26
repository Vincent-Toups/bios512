## Step 1

The first step is to create a git repository locally. We know how to do
that already. When you are ready to push to github, you create a
repository there like this:

![Creating a new repository.](./new_repository.png)

This will give you some instructions like this:

![Filling in the form](./new_form.png)

I'm sure there are situations where you might want to create a
repository <u>first</u> on github and then clone it, but it seems silly
to me. We have at least that much dignity.

We want the second set of instructions from this:

    …or create a new repository on the command line

    echo "# 611-example" >> README.md
    git init
    git add README.md
    git commit -m "first commit"
    git branch -M main
    git remote add origin git@github.com:Vincent-Toups/611-example.git
    git push -u origin main

    …or push an existing repository from the command line

    git remote add origin git@github.com:Vincent-Toups/611-example.git
    git branch -M main
    git push -u origin main

Indeed, these instructions sort of assume we're real git newbies, which
we are not. We are already on the branch `main` so we just need to say

``` bash
git remote add origin git@github.com:Vincent-Toups/611-example.git
git push -u origin main
```

But wait!

Before we do that we need to think about *authentication*.

If you are using Windows git probably installed a credential manager.
But I'm going to show you how to set up an SSH key so you don't have to
keep typing in your git password over and over and so you'll know how to
use ssh keys later for other reasons.


Next: ::git-ssh-key-pair:What is an SSH Key Pair?::.
