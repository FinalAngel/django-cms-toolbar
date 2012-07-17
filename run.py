# -*- coding: utf-8 -*-
from flask import Flask, render_template, g, request
from jinja2 import Markup
import os

app = Flask(__name__)

def render_placeholder(placeholder_type=None):
    if not g.edit and not g.layout:
        return ''
    if placeholder_type == 'start':
        index = g.index
        g.index += 1
        return Markup('<div id="cms_placeholder-%s" class="cms_placeholder">' % index)
    else:
        return Markup('</div>')

def render_placeholder_bar(title=''):
    if not g.layout:
        return ''
    else:
        return Markup(render_template('toolbar/bar.html', title=title, index=g.index))

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
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--public', action='store_true')
    parser.add_argument('--no-debug', dest='debug', action='store_false')
    parser.add_argument('--port', default=5000, type=int)
    args = parser.parse_args()
    host = '0.0.0.0' if args.public else '127.0.0.1'
    app.run(debug=args.debug, host=host, port=args.port)
