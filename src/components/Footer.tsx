import React from 'react'
import { ReactComponent as FooterLogo } from './../images/footer.svg'
import styled from '@emotion/styled';
import i18n from './../i18n';
import client from "./../client";
import { useHistory, useLocation } from 'react-router-dom'
import { SectionT } from './Section';


const Button = styled.button`
  border: none;
  background: none;
  color: white;

  &:hover {
    color: white;
    opacity: 0.5;
  }
`
type Props = {
  lang: string
  sections: SectionT[]
}

function Footer(props: Props) {
  const changeLanguage = (lang: string, history: any, location: any, oldSections: SectionT[]) => {
    let redirect = false
    const path = location.pathname.replace('/', '')
    const currentSection = oldSections.find((s) => { return s['slug'] === path })
    i18n.changeLanguage(lang).then((_t) => {
      if (path === 'calendar') {
        redirect = true
        return
      }
      client.get('/sections?_sort=sorting:ASC&_locale=' + lang).then((response: { data: any }) => {
        const newSections = response.data
        if (currentSection) {
          const otherSection = currentSection['localizations'].find((l: any) => { return l.locale === lang })
          const newCurrentSection = newSections.find((s: any) => { return s['id'] === otherSection['id'] })
          if (newCurrentSection) {
            redirect = true
            history.push('/' + newCurrentSection.slug)
          }
        }
      }).finally(() => {
        if (!redirect) {
          history.push('/')
        }
      })
    });
  }
  const location = useLocation();
  const history = useHistory();
  return <>
    <FooterLogo></FooterLogo>
    <nav className="footer-nav">
      <ul>
        <li>
          <Button className={props.lang === 'de' ? 'active' : ''} onClick={() => changeLanguage('de', history, location, props.sections)}>Deutsch</Button>
          <Button className={props.lang === 'fr' ? 'active' : ''} onClick={() => changeLanguage('fr', history, location, props.sections)}>Français</Button>
          <Button className={props.lang === 'it' ? 'active' : ''} onClick={() => changeLanguage('it', history, location, props.sections)}>Italiano</Button>
        </li>
      </ul>
    </nav>
  </>

}

export default Footer