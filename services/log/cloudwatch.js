const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = new winston.createLogger({
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
        })
    ]
});

function initializeLogger() {
    if (process.env.NODE_ENV === 'production') {
        const cloudWatchConfig = {
            logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
            logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
            awsOptions: {
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
                region: process.env.AWS_REGION,
            },
            messageFormatter: ({ level, message, additionalInfo }) => {
                return `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
            }
        }
        logger.add(new WinstonCloudWatch(cloudWatchConfig));
    }
}

module.exports = { logger, initializeLogger };