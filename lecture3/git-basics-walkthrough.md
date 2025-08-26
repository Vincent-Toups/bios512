# Git Basics

We create a git repository by going <u>into</u> the folder where we want
the repository to be and saying `git init`.

``` bash
cd /tmp/
rm -rf example
mkdir example
cd example
git init --initial-branch main
```

``` bash
Initialized empty Git repository in /tmp/example/.git/
```

Note that all a git repository is is a directory which has a `.git`
subdirectory. Of course that `.git` subdirectory is managed by `git` and
needs to be specific in its format.

Now we can enter the command which we will probably type most often in
our git lives:

``` bash
git status
```

``` bash
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```


Next: ::git-historical-note:A historical note::.
