import { from, of, merge, concat } from "rxjs";
import { switchMap, map } from "rxjs/operators";

const createUser = user =>
    new Promise(res => setTimeout(() => res(user), 1000));

const insertToken = token => new Promise(res => res(token));

const fakeWait = () => new Promise(res => setTimeout(() => res(), 2000));

async function doThing() {
    from(
        createUser({
            id: 12345,
            name: "hello world"
        })
    )
        .pipe(
            switchMap(newUser => {
                const token = insertToken({
                    requestedBy: newUser.id,
                    token: "im a token"
                });

                return from(token).pipe(
                    map(t => ({
                        ...newUser,
                        token: t
                    }))
                );
            })
        )
        .subscribe(async newUser => {
            await fakeWait();
            console.log(newUser);
        });
}

doThing();
