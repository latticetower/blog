---
layout: post
title: "Outreachy, depression and other friends"
date: 2016-08-02 12:21:00 +0300
categories: outreachy
tags: ["pymol", "Outreachy","apbs", "icfpc"]
---
For now it seems that I've stuck on `apbs` package tests.
One of them should be (these lines should appear in `debian/tests/control`): 
```
    Test-Command: python -c "from abpslib import *"
    Depends: @
```
It won't work, since<!--break--> apbs source in upstream source archive doesn't contain something which is compiled to `_apbslib.so` and `apbslib.py`.

For now I found that [APBS github repository](https://github.com/Electrostatics/apbs-pdb2pqr){:target="_blank"} really contains code, which produces these files, but they are not included to SourceForge tar.gz archive.
I could produce these files when I run this command from `apbs/` repository's subdirectory:
```
        cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_DOC=OFF -DBUILD_SHARED_LIBS=On -DCMAKE_SKIP_RPATH=On -DBUILD_TOOLS=Off \
        -DENABLE_OPENMP=On -DENABLE_MPI=On -DENABLE_ZLIB=On -DENABLE_PYTHON=On -DENABLE_READLINE=Off -DFETK_PATH=/usr \
        -DENABLE_FETK=Off -DENABLE_VERBOSE_DEBUG=On -DCMAKE_INSTALL_PREFIX=/data/src/apbs-pdb2pqr/apbs-install .
```
I also looked at issues page and found [issue 381](https://github.com/Electrostatics/apbs-pdb2pqr/issues/381){:target="_blank"}. It seems that for now this doesn't work and test I wrote to pdb2pqr, which also gets loaded from SourceForge as source archive, won't work for now and for some time.
It makes me depressed. Other reason is that I can't decide if I write them will it help to make it work NOW or not )

My friend would call this 'to be a perfectionist'. And it's hard not to be. 

When I start working on pymol, I found that there are several big directories with examples, and to test it the best possible way would be to run special script to run all examples from given directory.
I wrote it:

{% gist latticetower/250214fd37fe08e2b8f63c7bbad5be8d %}
It is not perfect (I should have used pipes for console output processing, but I didn't), but still works.

The main thing left to solve is to check all these files by hand and to fix paths, to make them not to raise various exception inside `PyMol` shell.

I also want to split pymol to 2 binary packages, and move to one of them architecture-independent examples part.
`apbs` requires the same fix, since `examples` folder is too big to be processed as a part of the main binary architecture-dependent package, but still useful.

Good thing is that I'll probably distract for this weekend. Today [ICFPC](http://icfpc2016.blogspot.ru/){:target="_blank"} has started, yay!
This will blow my depression away, since I like origami, which is this year's problem :) If I'll decide not to solve this, I'll go outdoors, since the best thing which helps not to stuck is to look aside for a moment (or a couple of hours).


