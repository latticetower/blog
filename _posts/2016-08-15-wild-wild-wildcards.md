---
layout: post
title:  "Wild-wild-wildcards!"
date: 2016-08-15 06:08:00 +0300
tags: ["pymol", "Outreachy"]
categories: outreachy pymol
---

What if you want to install with debian/install file all files in specific directory, except several names?
This won't work:

    examples/cookbook/(?!dali\.py|ribosome\.pml)*		/usr/share/pymol/examples/cookbook/

The problem is<!--break-->, `debian/install` supports wildcards, but does not regular expressions. I found this useful hint on [this page](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=147908).
It seems that all supported syntax is described (in Perl's glob documentation page)[http://perldoc.perl.org/File/Glob.html#bsd_glob].

Alas, it seems that I have 2 options - to name all installed files one by one, or to find pattern to mention only those I want to install.
I ended up with these lines:

    examples/cookbook/[abcdgmps]*.pml		/usr/share/pymol/examples/cookbook/
    examples/cookbook/ref_frame.pml		/usr/share/pymol/examples/cookbook/
    examples/cookbook/symsph.py		/usr/share/pymol/examples/cookbook/
    
PyMOL has several directories with example files, some of them are working. I've decided to add some of them to /usr/share/pymol, to enable user to call end explore them.
I also added fancy coloring to my test script =)
