The Dilemma
===========

If you have tried to set up a programming/data science environment before
you've probably discovered that this can be somewhat challenging, especially
if you don't want to make a mess.

For simplicity, in this course, I am going to hold my nose and we are all going
to use Jupyter notebooks. These have at least one key benefit: they abstract
away most of the complexity of _organizing_ code. And this is a key downside
as well, since they way they have you organize code sort of sucks. But that is
ok! We are hear to get some basic data science done and this is an adequate
way to do it.

:genimg:Jupiter::

So there are two ways. The first is to use mybinder.org:

https://mybinder.org/

The second will be to locally run Jupyter lab in a "container".

A container is basically a little virtual computer that runs on your computer.
The nice thing about containers is that they often are almost already completely
set up and they protect your computer from any messes you might make inside
the container as you install libraries, run code, etc.

```bash 
docker run -it --rm -p 8888:8888 \
  -v "$PWD":/home/jovyan/work \
  quay.io/jupyter/datascience-notebook:latest
```

This should look like this one windows:

```powershell 
docker run -it --rm -p 8888:8888 `
  -v "$(Get-Location):/home/jovyan/work" `
  quay.io/jupyter/datascience-notebook:latest
```
Class Participation
-------------------

:student-select:Why are you taking this class?; ../students.json::


Assuming you have installed docker.

This will set up a local development environment where you can work and run 
R code from jupyter notebooks.

Now that we've got a Jupyter lab running let's get comfortable with the interface.

(We will now switch to Jupyter)


  