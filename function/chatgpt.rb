require "aws-sdk-dynamodb"
require "dotenv"
require "json"
require "ruby-openai"

REGION = "ap-northeast-1"
TABLE_NAME = "chats"

def lambda_handler(event:, context:)
  # DynamoDBへの接続情報
  dynamodb = Aws::DynamoDB::Client.new(region: REGION)

  # クエリの設定
  params = {
    table_name: TABLE_NAME,
  }

  # DynamoDBへのクエリの発行
  begin
    response = dynamodb.scan(params)
    items = response.items.filter { _1["room_id"] == "1234" }.take(2)

    # 取得したレコードの出力
    return items.to_json
  rescue Aws::DynamoDB::Errors::ServiceError => error
    puts "Unable to scan table: #{error.message}"
  end
end
