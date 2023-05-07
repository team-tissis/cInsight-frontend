# cInsightFrontend

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
yarn start
```


### Deploy in EC2
Create `.env.production` file and write the following it.  
```bash
HTTPS=True
REACT_APP_API_HOST=https://(public IP of EC2 instance)
REACT_APP_TOKEN=(Token issued by backend server)
```
Then, You can run
```bash
yarn start:production
```

## Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
