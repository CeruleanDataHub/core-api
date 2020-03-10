import os

def get_env_variable(name):
    try:
        return os.environ[name]
    except KeyError:
        message = "Expected environment variable '{}' not set.".format(name)
        raise Exception(message)

# the values of those depend on your setup
PGHOST = get_env_variable("PGHOST")
PGUSER = get_env_variable("PGUSER")
PGPASSWORD = get_env_variable("PGPASSWORD")
PGDATABASE = get_env_variable("PGDATABASE")

DB_URL = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(user=PGUSER,pw=PGPASSWORD,url=PGHOST,db=PGDATABASE)

