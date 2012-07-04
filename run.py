# -*- coding: utf-8 -*-
from flask import Flask, render_template, g, request
from jinja2 import Markup
import os

app = Flask(__name__)

def render_placeholder(placeholder_type=None):
    if not request.args.get('edit', False):
        return ''
    if placeholder_type == 'start':
        index = g.index
        g.index += 1
        return Markup('<div id="cms_placeholder-%s" class="cms_placeholder">' % index)
    else:
        return Markup('</div>')

def render_placeholder_bar(title=''):
    if not request.args.get('edit', False):
        return ''
    return Markup('''
        <div id="cms_placeholder-bar-%s" class="cms_reset cms_placeholder-bar">
            <div class="cms_placeholder-title">%s</div>
            <div class="cms_placeholder-btn">
                <a href="#"><span>Plugins</span></a>
                <ul>
                    <li class="title"><span>Core plugins</span></li>
                    <li><a href="#">Text</a></li>
                    <li><a href="#">Link</a></li>
                    <li><a href="#">Picture</a></li>
                    <li><a href="#">File</a></li>
                    <li><a href="#">Flash/Video</a></li>
                    <li class="title"><span>Advanced plugins</span></li>
                    <li><a href="#">Google Map</a></li>
                    <li><a href="#">Teaser</a></li>
                    <li><a href="#">Twitter</a></li>
                    <li><a href="#">Snippet</a></li>
                    <li><a href="#">Inherit</a></li>
                </ul>
            </div>
        </div>
    ''' % (g.index, title))

@app.context_processor
def template_tags():
    return {'render_placeholder': render_placeholder, 'render_placeholder_bar': render_placeholder_bar}

@app.before_request
def before_request():
    g.index = 0
    g.draft = request.args.get('draft', False)
    g.edit = request.args.get('edit', False)
    g.layout = request.args.get('layout', False)
    g.view = request.args.get('view', False)

@app.route('/')
@app.route('/render/<path:path>/')
def index(path='index'):
    path = '%s.html' % os.path.splitext(path)[0].rstrip('/')
    return render_template(path)

if __name__ == '__main__':
    app.run(debug=True)
