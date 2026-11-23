import { Link } from 'react-router'
import { paginaInicial, rotuloPaginaInicial } from '../auth/paginaInicial'
import { useAuth } from '../auth/useAuth'
import { IconAspas, IconBrilho, IconBusca, IconEstrela, IconOk, IconSetaDiagonal } from '../components/icons'
import { Logo } from '../components/ui'

const ANO = new Date().getFullYear()

const PASSOS = [
  {
    icone: <IconBusca size={20} />,
    titulo: 'Encontre o professor',
    texto: 'Busque pelo nome ou filtre por instituição, curso e disciplina.',
  },
  {
    icone: <IconAspas size={20} />,
    titulo: 'Veja o que os alunos dizem',
    texto: 'Notas de 1 a 5 em critérios como didática e clareza, com comentários de quem assistiu às aulas.',
  },
  {
    icone: <IconBrilho size={20} />,
    titulo: 'Avalie seus professores',
    texto: 'Avalie os professores com quem você estudou. Pode ser anônimo, e dá para editar nas primeiras 24 horas.',
  },
]

function Ilustracao() {
  return (
    <div className="ilustra" aria-hidden="true">
      <span className="ilustra__orbita" />
      <span className="ilustra__orbita ilustra__orbita--elipse" />
      <IconBrilho className="ilustra__brilho ilustra__brilho--azul" size={22} />
      <IconEstrela className="ilustra__brilho ilustra__brilho--laranja" size={14} />

      <div className="ilustra__card">
        <div className="ilustra__card-topo">
          <span className="ilustra__avatar">M</span>
          <span className="ilustra__pontos">•••</span>
        </div>
        <span className="ilustra__linha" style={{ width: '80%' }} />
        <span className="ilustra__linha" style={{ width: '62%' }} />
        <span className="ilustra__linha ilustra__linha--destaque" style={{ width: '40%' }} />
        <div className="ilustra__estrelas">
          {[0, 1, 2, 3, 4].map((i) => (
            <IconEstrela key={i} size={15} />
          ))}
          <span>Didática 4,5</span>
        </div>
        <span className="ilustra__rodape">Engenharia de Software</span>
      </div>

      <div className="ilustra__mini">
        <span className="ilustra__mini-icone">
          <IconBrilho size={14} />
        </span>
        <span>
          Avaliação
          <br />
          <strong>anônima</strong>
        </span>
      </div>
    </div>
  )
}

export function Inicio() {
  const { usuario } = useAuth()

  return (
    <div className="inicio">
      <header className="inicio__header">
        <div className="inicio__wrap inicio__header-inner">
          <Logo para="/" altura={44} />
          <nav aria-label="Principal" className="inicio__nav">
            <Link to="/professores">Explorar</Link>
            <a href="#como-funciona">Como funciona</a>
          </nav>
          {usuario ? (
            <Link to={paginaInicial(usuario)} className="btn btn--secondary btn--sm">
              {rotuloPaginaInicial(usuario)}
            </Link>
          ) : (
            <Link to="/login" className="btn btn--secondary btn--sm">
              Entrar
            </Link>
          )}
        </div>
      </header>

      <div className="inicio__wrap">
        <main>
          <section className="inicio__hero">
            <div>
              <p className="eyebrow">Avaliação de professores · UNIFACOL</p>
              <h1 className="inicio__titulo">
                Avalie e encontre <span>professores</span> da UNIFACOL.
              </h1>
              <p className="inicio__sub">
                Veja as notas que os alunos deram a cada professor, por critério e por disciplina, antes de escolher suas turmas.
              </p>

              <div className="inicio__acoes">
                {usuario ? (
                  <Link to={paginaInicial(usuario)} className="btn btn--primary btn--lg">
                    {rotuloPaginaInicial(usuario)} <IconSetaDiagonal />
                  </Link>
                ) : (
                  <>
                    <Link to="/login?modo=cadastro" className="btn btn--primary btn--lg">
                      Criar conta <IconSetaDiagonal />
                    </Link>
                    <Link to="/login" className="btn btn--secondary btn--lg">
                      Entrar
                    </Link>
                  </>
                )}
              </div>
              <p className="selo">
                <IconOk size={16} /> Só alunos podem avaliar.
              </p>
            </div>
            <Ilustracao />
          </section>

          <section id="como-funciona" className="inicio__secao" aria-labelledby="titulo-como-funciona">
            <div className="inicio__secao-topo">
              <div>
                <p className="eyebrow">Como funciona</p>
                <h2 id="titulo-como-funciona" className="inicio__h2">
                  Busque, compare e avalie.
                </h2>
              </div>
              <p className="inicio__sub">
                Para ver e fazer avaliações é preciso entrar com uma conta.
              </p>
            </div>

            <ol className="passos">
              {PASSOS.map((p, i) => (
                <li key={p.titulo} className="passo">
                  <div className="passo__topo">
                    <span className="passo__icone">{p.icone}</span>
                    <span className="passo__numero">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>

      <section className="inicio__cta">
        <div className="inicio__wrap inicio__cta-inner">
          <img src="/logo-facolsi.jpg" alt="" width={96} height={96} />
          <div className="inicio__cta-texto">
            <h2>Avalie seus professores.</h2>
            <p>Crie uma conta ou entre para ver e fazer avaliações.</p>
          </div>
          <div className="inicio__cta-acoes">
            {usuario ? (
              <Link to={paginaInicial(usuario)} className="btn btn--claro btn--lg">
                {rotuloPaginaInicial(usuario)}
              </Link>
            ) : (
              <>
                <Link to="/login?modo=cadastro" className="btn btn--claro btn--lg">
                  Criar conta
                </Link>
                <Link to="/login" className="btn btn--contorno btn--lg">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="inicio__wrap inicio__rodape">
        <span>© {ANO} UNIFACOL — Centro Universitário Facol · FacolSI</span>
        <span>Avaliação de Professores</span>
      </footer>
    </div>
  )
}
