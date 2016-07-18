---
layout: post
title: "Outreachy: testsuite for PyMol"
date: 2016-07-18 10:23:00 +0300
categories: outreachy
tags: ["pymol", "Outreachy"]
---
Today I decided to start working on testsuite for PyMoL.
I haven't finished tests for [2 RostLab packages]({% post_url 2016-07-17-outreachy-report %}){:target="_blank"}, and we decided to wait for answer from upstream maintainers - I thought we need some additional details on `profphd`upstream ChangeLog to make everything work. For now it's better not to waste time while waiting and move forward.

And for now I'll write tests for it. It's great! I love PyMol! 

But it also seems to be very scary - I haven't wrote tests for debian packages with visual interface before, and I expect in worst case I'll spend a lot of time to make it work on chroot inside vagrant Virtual Box VM.

But it is also very interesting )
