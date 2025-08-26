# A historical note

In older projects you might notice that the most important branch is
often called "master." Given the history of western civilization and the
ongoing impact of historical slavery in people's lives, the tendency has
gradually shifted to using "main" as the most important branch.

But this also serves as a good segue into the following useful comment:
there is nothing special about the main branch - "main" is just a name
which we apply to a branch to communicate the fact that it is an
important branch. But from git's point of view, there isn't anything
magical about it. A git repository can have many branches named whatever
we'd like. It can, in fact, have multiple branches totally unrelated to
one another, with no history in common.

As we will learn when we discuss git concepts later, a branch is just a
name pointing to a commit and a little bit of logic which tells that
pointer to move forward when new commits are added to the branch.

The `git status` invocation we performed above tells us about the
current status of the repository we are in. `git` commands work anywhere
beneath the directory.


Next: ::git-version-control-baby:What is Version Control (Baby Version)::.
