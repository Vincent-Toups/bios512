# What is Version Control (Baby Version)

We've seen how to run git but what does it do?

Simple version: git maintains a history of your codebase as a chain of
"commits."

Let's see what that looks like:

``` bash
cat <<EOF > README.md
Example
=======

This is an example readme at the first commit.

EOF

git status
```

``` bash
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
    README.md

nothing added to commit but untracked files present (use "git add" to track)
```

(Note - this business with EOF (stands for "End of File") is called a
"here doc" because it's a document right here. This is just a "stupid
shell trick" to create a file in a shell script.

Now we will make our first commit.

``` bash
git add README.md # tell git we want README.md to be in the upcoming commit.
git config --global user.email "toups@email.unc.edu"
git config --global user.name "Vincent Toups"
# we only have to do the above once.
git commit -m "Initial commit."
```

``` bash
[main (root-commit) ab48777] Initial commit.
 1 file changed, 5 insertions(+)
 create mode 100644 README.md
```

And the status:

``` bash
git status
```

``` bash
On branch main
nothing to commit, working tree clean
```

And now we can ask git to tell us the history of the project so far:

``` bash
git log 
```

``` bash
commit 3b04865fb07730643d9358b465713ef50e5177ba
Author: Vincent Toups <toups@email.unc.edu>
Date:   Mon Aug 30 11:34:03 2021 -0400

    Initial commit.
```


Next: ::git-additional-commits:Additional Commits::.
