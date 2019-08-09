// import express from 'express';

// const app = express();

// app.use((req, response, next) => {

// });

import { createServer, request } from "http";
import { from, of, merge, fromEvent, BehaviorSubject, Observable } from "rxjs";
import {
    tap,
    filter,
    mapTo,
    map,
    reduce,
    withLatestFrom,
    takeUntil,
    buffer,
    pluck,
    switchMap,
    ignoreElements,
    share
} from "rxjs/operators";
import qs from "querystring";

function get(path) {
    return context =>
        context.pipe(
            filter(({ method, url }) => method === "GET" && url === path)
        );
}

function post(path) {
    return context =>
        context.pipe(
            filter(({ method, url }) => method === "POST" && url === path)
        );
}

function send(data) {
    return context =>
        context.pipe(
            map(ctx => {
                const newContext = {
                    ...ctx,
                    data: typeof data === "function" ? data(ctx) : data
                };

                return newContext;
            })
        );
}

const handlers = context =>
    merge(
        context.pipe(
            get("/hello"),
            send(ctx => ctx)
        ),
        context.pipe(
            post("/echo"),
            send(ctx => ctx.body)
        )
    );

const bodyParser = request =>
    fromEvent(request, "data").pipe(
        map(buffer => buffer.toString()),
        map(b => JSON.parse(b)),
        share()
    );

const server = createServer((request, response) => {
    const context = of({
        url: request.url,
        method: request.method,
        headers: request.headers,
        status: 200
    }).pipe(share());

    if (request.method === "POST") {
        const body = bodyParser(request);

        handlers(
            body.pipe(
                withLatestFrom(context),
                map(([b, ctx]) => ({ ...ctx, body: b }))
            )
        ).subscribe(ctx => {
            const { status, headers, data } = ctx;

            response.writeHead(status, headers);
            response.write(
                typeof data === "string"
                    ? Buffer.from(data)
                    : Buffer.from(JSON.stringify(data))
            );
            response.end();
        });
    } else {
        handlers(context).subscribe(ctx => {
            const { status, headers, data } = ctx;

            response.writeHead(status, headers);
            response.write(
                typeof data === "string"
                    ? Buffer.from(data)
                    : Buffer.from(JSON.stringify(data))
            );
            response.end();
        });
    }
});

server.listen(5000, () => {
    console.log("listening on 5000");
});
