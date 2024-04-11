Booking service with python django and react and material ui

Для того чтобы запустить локально проект необходимо установить python и npm:

```
sudo apt install python3
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install nodejs
```

Затем выполнить следующие команды:

```
pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
cd frontend/
npm install
npm run dev
```

Затем можно открыть ссылку http://127.0.0.1:8000/register и протестировать работу приложения
