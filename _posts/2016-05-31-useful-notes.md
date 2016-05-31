---
layout: post
title: "Outreachy notes: project setup"
date: 2016-05-31 8:29:00 +0300
categories: outreachy useful
tags: ["debian unstable", "vagrant setup", "Outreachy"]
---

Hurray! Now I'm an [Outreachy program](https://wiki.gnome.org/Outreachy){:target="_blank"} intern in Debian-Med Team!

My internship started with two problems: I've got a cold in [Genehack-2]({% post_url 2016-05-23-genehack-2 %}){:target="_blank"} and had unexpected troubles with my main task - testing.
First problem was quite easy to solve - by staying home.

Second problem... Well, it came out of nothing and was is totally was *a problem* because of my stubbornness.

When I need to write something which should run on different OS or be sandboxed, I prefer to rely on [Vagrant](https://www.vagrantup.com/){:target="_blank"}. It runs a virtual machine for me and usually all goes fine. Not this time!

The problem came out suddenly with installation problems when I had to install [cme](https://github.com/dod38fr/config-model/wiki/Managing-Debian-packages-with-cme){:target="_blank"}. During bonding stage I didn't run cme and all seemed to be fine. Ok, then I moved to unstable version of Debian in sources.list, and it didn't solve nothing! But I spent too much time on trying to tweak debian-jessie box for my needs :(

Moving to VM box with unstable Debian and some additional setup in Vagrant configuration solved all problems. I should do it earlier!

Here are my Vagrant configuration file and bash script with some setup:
{% gist latticetower/bc5251d5d607dd779a5c347dc1aafade Vagrantfile %}
{% gist latticetower/bc5251d5d607dd779a5c347dc1aafade bootstrap.sh %}

I'll update them if some details come out - hope this configuration files help somebody. I haven't fixed the Strange-Behaviour-With-SSH-Forwarding yet, probably I'll fix it next week.

And remember, my invisible reader, stubbornness is your worst enemy!
