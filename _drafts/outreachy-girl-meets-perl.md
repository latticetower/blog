---
layout: post
title: "Outreachy: girl meets perl"
date: 2016-06-23 17:03:00 +0300
categories: outreachy useful
tags: ["perl", "Outreachy"]
---
Last weekend I wrote poetry.

Sometimes I do it, when there are too much feelings inside and I want to free them.

That poem I wrote reminds Robert Browning's poem "Childe Roland to the Dark Tower Came", it is full of sharp words like "horrible", "glimpse" and others. I'm like a knight in shining armor. And bad dragon or some malicious creature of the night is named perl. Yeah, like programming language.

Actually, I was inspired by my own whole-weekend-struggle with perl packages.
There were few packages, closely dependent with each other, some of them are written in perl. At least one of them is compartible with older version of perl (namely, 5.16. BTW, current unstable debian by default installs perl 5.20 or perl 5.22).

There is perlbrew, which can be useful when you want to work with all versions of perl. But there was problem with perl installation. It spend a lot of time to figure out what's wrong with perl installation. The problem was with time synchronization between VM and host machine.

Package I tried to test used several dependencies, one of these dependencies produced it's own errors. And it added mess and uncertainty to old-perl problems.

Finally I decided to test all packages together, one by one.
