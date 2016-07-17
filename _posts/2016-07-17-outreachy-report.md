---
layout: post
title: "Outreachy: monthly"
date: 2016-07-17 06:32:00 +0300
categories: outreachy
tags: ["perl", "Outreachy", "RostLab packages", "useful"]
---

Month ago I wrote [a post]({% post_url 2016-06-15-outreachy-chasing-the-timeline %}){:target="_blank"} with current progress with my  [Outreachy](https://wiki.gnome.org/Outreachy){:target="_blank"} internship.

Reality once again ruined my plans :) <!--break-->

That's what I've done since June, 15th:
   
{% gist latticetower/9224518427ab8e79da870c2c5430dd71 %}

My initial timeline had pair of packages which made me do all these packages.
`predictprotein` package turned out to be a complex pipeline, which uses long list of other packages. There also was `disulfinder`, and `Proftmb` - both programs by RostLab.

`Predictprotein` raised millions of errors, and some of these errors appeared because of packages it depends on. I thought that it would be good to write tests to other RostLab packages, since they are all connected (some of them are dependencies for others). That's why I decided to write tests for [all packages in this directory](http://anonscm.debian.org/viewvc/debian-med/trunk/packages/rostlab/), and only after that to move forward.

I decided to skip some of them - for example, pp-popularity-contest, since it doesn't do anything biomedically significant, except sending usage reports to RostLab.
I also skipped `pssh2` (because couldn't figure out for now how to get sources), `libai-fann-perl` (moved to Debian Perl Group), and tried to do my best to fix as many errors as I can and write as many tests as I can.

When I was working on them, I learned about [`autopkgtest-pkg-perl`](https://pkg-perl.alioth.debian.org/autopkgtest.html), which helped me a lot. 

Some of these packages were written in fortran, and I was very grateful to my former scientific advisor for asking me to implement [old folding algorithm in Scala](https://github.com/biocad/sdr_tools) - because of that I already knew, how fortran code may look like (algorithm's parameters had readme file with small portions of fortran code) and I wasn't afraid of it :)

The Top-1 Scariest Fortran Program in my personal scaryness rating is `profnet` - this source package produces 8 binary packages. And for them I wrote 1 test:

{% highlight sh %}
#!/bin/sh
# this test needs package name as a parameter for execution 

set -e

pkg="$1"

if [ -z "$pkg" ] ; then
  echo "Provide correct package name as a parameter";
  exit 1;
fi

command=$(echo $pkg | sed -e "s/-/_/g") 
#this returns corresponding executable name

if [ "$ADTTMP" = "" ] ; then
  ADTTMP=$(mktemp -d /tmp/${pkg}-test.XXXXXX)
  trap "rm -rf $ADTTMP" 0 INT QUIT ABRT PIPE TERM
fi

cd $ADTTMP

cp -a /usr/share/doc/${pkg}/examples/* .
find . -type f -name "*.gz" -exec gunzip \{\} \;
for lnk in `find . -type l -name "*.gz"` ; do
    ln -s `basename $(readlink $lnk) .gz` `echo $lnk | sed 's/\.gz$//'`
    rm $lnk
done

$command switch 385 55 10 46 100 PROFin.dat PROFacc_tst.jct none
echo "Test finished successfully"
{% end highlight %}

This test requires binary package name as a parameter for execution, and it is ok since all mentioned 8 binary packages have similar structure.
Apparently, only 5 of 8 packages work well with this test. Other 3 end up with segmentation fault. I think they require some additional fixes or parameters, but I couldn't find out what's wrong and what parameters I should provide to run them. For now. That's why test for `profnet` is incomplete.

I haven't fixed `profphd` yet, since it requires old version of perl, and I don't speak perl well enough yet to fix it. 

`Predictprotein` appeared to be just worst of all. It requires ~30GB database, which [should be installed by hand](https://wiki.debian.org/DebianMed/PredictProtein). And still it is outdated, and raises error. Because this is BLASTP database, outdated version. 
`Predictprotein` uses `blastpgp` program (from ncbi-blast+ package), and latest version of this program fails on that database.

That made me think a lot about typical problems with bioinformatics software - lack of standardization and database versioning.

But `blastpgp` works well with latest BLASTP database from NCBI website. 
I tried to run and it works! But I run by hand, and had patched profphd version installed (haven't committed yet). And problem with database remains - probably I'll try to make smaller version of NCBI database and use it to make testsuite for autopkgtest.

Packages `metastudent` and `libgo-perl` raised errors during `predictprotein` run. That's why I had to write test for these two and to fix errors.

The best thing is - I almost finished that nasty RostLab's packages! Hope next week I could start working on `r-cran-bio3d` or `pymol` tests.
