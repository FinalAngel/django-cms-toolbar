###############
How to run this
###############


**********
First time
**********

#. Make a virtualenv: ``virtualenv env``
#. Activate the virtualenv: ``source env/bin/activate``
#. Install dependencies: ``pip install -r requirements.txt``
#. Run the server: ``python run.py``
#. Open website in browser at ``http://localhost:5000/``


*******************
After initial setup
*******************

#. Activate the virtualenv: ``source env/bin/activate``
#. Run the server: ``python run.py``
#. Open website in browser at ``http://localhost:5000/``


*************
Compiling CSS
*************

#. Go to project root path
#. Autocompile changes using ``compass watch static``
#. Compile CSS using ``compile static -e production``