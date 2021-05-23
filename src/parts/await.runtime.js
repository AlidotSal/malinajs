
import { $$removeElements, firstChild, insertBefore } from '../runtime/base';
import { $watchReadOnly } from '../runtime/cd';

export function $$awaitBlock($cd, label, fn, $$apply, build_main, tpl_main, build_then, tpl_then, build_catch, tpl_catch) {
    let promise, childCD;
    let first, last, status = 0;

    function remove() {
        if(!childCD) return;
        childCD.destroy();
        childCD = null;
        $$removeElements(first, last);
        first = last = null;
    };

    function render(build, tpl, value) {
        if(childCD) remove();
        if(!tpl) return;
        childCD = $cd.new();
        let fr = tpl.cloneNode(true);
        build(childCD, fr, value);
        $$apply();
        first = fr[firstChild];
        last = fr.lastChild;
        insertBefore(label, fr, label.nextSibling);
    };

    $watchReadOnly($cd, fn, p => {
        if(status !== 1) render(build_main, tpl_main);
        status = 1;
        if(p && p instanceof Promise) {
            promise = p;
            promise.then(value => {
                status = 2;
                if(promise !== p) return;
                render(build_then, tpl_then, value);
            }).catch(value => {
                status = 3;
                if(promise !== p) return;
                render(build_catch, tpl_catch, value);
            });
        }
    });
}
