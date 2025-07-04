This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Add a .env file like this:
```
DATABASE_URL="postgresql://postgres:<password>@localhost:5433/smartpool"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<password>
POSTGRES_DB=smartpool
MQTT_BROKER_URL="mqtt://<platform_ip>:1883"
INFLUX_URL="http://<platform_ip>:8181"
INFLUX_TOKEN=<influxdb_token>
INFLUX_BUCKET="smartpool"
IOT_API_URL="http://<platform_ip>:5001"
JWT_SECRET=<secret_key>
```


```
npm install

npx prisma generate

npx prisma migrate deploy

npx prisma db seed

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
