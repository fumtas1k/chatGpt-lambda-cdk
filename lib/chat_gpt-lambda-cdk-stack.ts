import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { EndpointType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

export class ChatGptLambdaCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaRole = new Role(this, "lambdaRole", {
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),],
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });


    const dynamoTable = new Table(this, 'chats', {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING
      },
      tableName: "chats",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new Function(this, "getItem", {
      functionName: "getItem",
      handler: "chatgpt.lambda_handler",
      runtime: Runtime.RUBY_2_7,
      code: new AssetCode("function"),
      memorySize: 512,
      timeout: Duration.seconds(10),
      role: lambdaRole,
    });

    const apiGw = new RestApi(this, "apiGw", {
      endpointTypes: [EndpointType.REGIONAL],
      deployOptions: {
        stageName: "dev1",
      }
    });
    const chatGpt = apiGw.root.addResource("get");
    chatGpt.addMethod("GET", new LambdaIntegration(lambda));
  }
}
