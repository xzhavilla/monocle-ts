import { array } from 'fp-ts/lib/Array'
import { task, Task } from 'fp-ts/lib/Task'
import { fromTraversable, Getter, Iso, Lens, Traversal } from '../src'

type Identifier = number

interface ProxyFoo {
  barId: Identifier
}

interface ProxyFoobar {
  foos: Array<ProxyFoo>
}

interface Bar {
  id: Identifier
}

interface Foo {
  bar: Bar
}

interface Foobar {
  foos: Array<Foo>
}

const foosLens: Lens<ProxyFoobar, Array<ProxyFoo>, Foobar, Array<Foo>> = Lens.fromProp<ProxyFoobar, Foobar>()('foos')
const fooTraversal: Traversal<Array<ProxyFoo>, ProxyFoo, Array<Foo>, Foo> = fromTraversable(array)<ProxyFoo, Foo>()
const barLens: Lens<ProxyFoo, Identifier, Foo, Bar> = new Lens(
  proxyFoo => proxyFoo.barId,
  bar => proxyFoo => ({ bar: bar })
)
declare const barGetter: Getter<Identifier, Task<Bar>>

declare const proxyFoobar: ProxyFoobar
const foobar: Task<Foobar> = foosLens
  .composeTraversal(fooTraversal)
  .composeLens(barLens)
  .modifyF(task)(barGetter.get)(proxyFoobar)

interface MaxModel {}

interface MadModel {
  max: MaxModel
}

interface MaxView {}

interface MadView {
  max: MaxView
}

const maxLens: Lens<MadModel, MaxModel, MadView, MaxView> = Lens.fromProp<MadModel, MadView>()('max')
declare const maxIso: Iso<MaxModel, MaxView>

declare const madModel: MadModel
const fooView: MadView = maxLens.modify(maxIso.get)(madModel)
