# Additional Commits

At its most basic level we use git by rinsing and repeating the above
process.

``` bash
cat <<EOF > hello.R
print("Hello World.");
EOF
git add hello.R
git commit -m "Initial R source file."
```

``` bash
[main 32dd9c2] Initial R source file.
 1 file changed, 1 insertion(+)
 create mode 100644 hello.R
```

Note that a commit consists of ONLY those changes we tell git to add to
it with `git add`. If you have used subversion (unlikely since this
class is mostly youngsters) this is not how things work. Git doesn't
"track" files. It just records changes which you tell it to record.

Let's modify our README to see what a change to a file that is already
in the repository history looks like.

``` bash
cat <<EOF > README.md
Example
=======

This is an example readme.

In addition to editing the line above we've added
some lines for didactic purposes.

EOF

git status
```

``` bash
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
    modified:   README.md

no changes added to commit (use "git add" and/or "git commit -a")
```

Note that git is telling us that a file is modified but that no changes
are staged for commit.

If we want more details we can ask:

``` bash
git diff # read as "git difference"
```

``` bash
diff --git a/README.md b/README.md
index 818a9f8..3dbf654 100644
--- a/README.md
+++ b/README.md
@@ -1,5 +1,8 @@
 Example
 =======

-This is an example readme at the first commit.
+This is an example readme.
+
+In addition to editing the line above we've added
+some lines for didactic purposes.

```

The above is a patch. It describes how we need to change the previous
state of the repository to make it match what we have now. Just squint
at it for now, we'll learn to read patches in detail later.

Let's create a new file so we can see how things work when there are
multiple changes.

``` bash
cat <<EOF > hello.py
print("Hello World.");
EOF
git status
```

``` bash
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
    modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
    hello.py

no changes added to commit (use "git add" and/or "git commit -a")
```

Now one really nice thing about git is that it really does tell you how
to use it if you just read the output of git status. Let's stage just
the new file:

``` bash
git add hello.py
git status
```

``` bash
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
    new file:   hello.py

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
    modified:   README.md

```

Now we can see that if we `commit` the commit will only contain
`hello.py`.

``` bash
git commit -m "Added hello.py"
git status
```

``` bash
[main 561ace2] Added hello.py
 1 file changed, 1 insertion(+)
 create mode 100644 hello.py
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
    modified:   README.md

no changes added to commit (use "git add" and/or "git commit -a")
```

Sure enough - we no longer see any information about `hello.py` but our
other changes are still there.


Next: ::git-trinity:The Git Trinity::.
