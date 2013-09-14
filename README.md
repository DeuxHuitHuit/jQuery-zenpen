# jQuery ZenPen

## The minimal editor for the modern man

This is a major refactor of the original ZenPen project:

> Zenpen (<http://zenpen.io>) is a web app for writing minimally, and getting into the Zone.

> <https://github.com/tholman/zenpen>

The goal was to break free from the original web app and enable easy reuse via jQuery plugin. This
way, the ZenPen editor would be usable inside other apps.

I basically wrote the plugin shell first, then copied and refactored the original code. For the sake of
the original author, I wanted to use as much of his code as possible. But, the orginal plugin had a bunch
of function to wrap the native API and I though that porting those were not interessing, so I re-wrote some of
the code to use jQuery instead.

I also wanted to be able add custom behavior via plugins of the plugin itself. For this, see 
`$.zenpen.actions` object.

** A big thanks to Tim Holman, the original author. **