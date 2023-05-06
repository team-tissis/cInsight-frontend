# ChainInsight Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup

```
$ npm install --legacy-peer-deps
```

### Development

Create `.env.development` file and write the following it.  
You can refer to `.env.development.sample`.

```bash
REACT_APP_API_HOST=http://localhost:8000
REACT_APP_TOKEN=(Token issured by backend server)
```

Then, You can run

```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
```

### Deploy in EC2

Create `.env.production` file and write the following it.

```bash
HTTPS=True
REACT_APP_API_HOST=https://(public IP of EC2 instance)
REACT_APP_TOKEN=(Token issured by backend server)
```

Then, You can run

```bash
yarn start:production
```
