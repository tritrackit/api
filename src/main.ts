import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import * as bodyParser from "body-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DataSource } from "typeorm";
import { TypeOrmConfigService } from "./db/typeorm/typeorm.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");
  // the next two lines did the trick
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>("PORT");
  const options = new DocumentBuilder()
    .setTitle("tritrackit-api")
    .setDescription("A documentation for tritrackit-api")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" },
      "jwt"
    )
    .addApiKey({ type: "apiKey", in: "header", name: "X-API-Key" }, "apiKey")
    .build();
  // the next two lines did the trick
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
    customfavIcon: "https://avatars0.githubusercontent.com/u/7658037?v=3&s=200",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js",
    ],
    customCssUrl: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css",
    ],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const dataSource = app.get(DataSource);
  TypeOrmConfigService.dataSource = dataSource; // ✅ store it here
  await app.listen(port, () => {
    console.log("[WEB]", config.get<string>("BASE_URL") + "/swagger");
  });
}
bootstrap();
