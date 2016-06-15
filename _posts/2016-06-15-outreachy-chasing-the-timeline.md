---
layout: post
title: "Outreachy: chasing the timeline"
date: 2016-06-15 21:30:00 +0300
categories: outreachy
tags: ["debian unstable", "timeline", "Outreachy"]
---

I started my [Outreachy](https://wiki.gnome.org/Outreachy){:target="_blank"} internship with clear and precise timeline, which was part of my application.

Reality ruined it. I haven't planned [to get ill or to spend too much time figuring out what's wrong with Vagrant]({% post_url 2016-05-31-useful-notes %}){:target="_blank"}.

That's what my initial timeline looks like:

{% gist latticetower/4402a17488c1629a78595bf4c9ec9b50 %}

And that's what I've done for now:
   
Following table contains packages I worked on for by June, 15, 2015:

|       Package            |  What I did         | 
| --------------------- | -------------------------- |
| Concavity       | 1 test + *1 serious bug fixed*  |
| Conservation-code       | 2 tests + 1 small patch    |
| Dssp     | 1 test + example files |
| Profbval | 1 test |
| Tm-align | 1 test (for both TMalign and TMscore) + example files
| Predictnls | 1 test |
| Pdb2pqr | 3 tests + 4 lintian warnings fixed |

In each case I added README.test with basic description how to test package manually. It partially replicates man for package, but in some cases I try to mention things like "this programs takes exactly 6 or 7 parameters" or "writes diagnostic messages or errors in input file to stderr - it's normal when these messages appear".

And yes, I've managed to fix [my first bug!](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=822382#10){:target="_blank"}

Comparing What I Have Done vs. Ideal Timeline, it seems that I'm almost in time.

But at planning stage I thought I would have enough time to read related articles and could do tests for more that 2 packages per week.

Nope! Because some packages are more complex and require more time to spend comparing to other. Some of the reasons are:
- complex built system,
- different submodules involved in call with different parameters,
- package dependencies,
- etc.

Last package I worked on - `pdb2pqr` - is a huge pipeline, which has a collection of tests accompanying source code. But I haven't made these tests work yet. To run them via autopkgtest requires to install them with additional [scons](http://scons.org/){:target="_blank"} files to proper locations. I haven't figured out yet what files should I install to make installed tests work, and decided to check everything is ok first.

It turned out that with one specific parameter all goes wrong, because some files are not installed. Well, I fixed that and checked again. It turned out that during call with the same specific parameter program also uses [networkx library](https://networkx.github.io/). Well, I added it to `debian/control` as package dependency (but still not sure if I should add it to 'Recommends' or 'Depends' list). I decided to stop there, with 3 tests added and 4 lintian warnings removed. And to look again several days later.

Next package to look at should be `Predictprotein` or `r-cran-bio3d`. First one seems to require older version of perl (and I'll probably have to figure out how to mention it in `debian/control` file), second is too complex, and I'll have to refresh my R skills, yay! But it definitely will be very time-consuming. I even plan to make blog post on how to use it and probably try to write some .Rmd script.

For now, I've made a good very good decision to figure out how to work with package located in SVN repository, without waiting if someone moves it to Git for me.

Next possible good decision is already planned: to make small [Atom](atom.io) plugin (or bash script, or whatever - it can be anything, but I like to edit files in Atom) to create 'template' files with repeated content for packages I start working on, to open these new template files in Atom (or open existing files, if they already present). 

Hope this future decision - to automate repeated parts - will make my timeline look  pessimistic rather than realistic.
