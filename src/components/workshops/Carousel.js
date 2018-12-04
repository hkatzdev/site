import React, { Component, Fragment } from 'react'
import Slider from 'react-slick'
import { remove } from 'lodash'

import api from 'api'
import styled from 'styled-components'
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  theme
} from '@hackclub/design-system'

import CarouselProject from 'components/workshops/CarouselProject'
import CarouselSubmissionForm from 'components/workshops/CarouselSubmissionForm'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const RehackSlider = styled(Slider)`
  align-self: stretch;
`

const CarouselOuter = styled(Flex).attrs({
  bg: 'smoke',
  pt: [2, 2, 3],
  pb: [3, 3, 4],
  flexDirection: 'column',
  align: 'center'
})``

const StaticWrapper = styled(Flex).attrs({ mb: [3, 3, 4], justify: 'center' })`
  align-self: stretch;
`

const SliderWrapper = styled(Box).attrs({ mb: [3, 3, 4] })`
  align-self: stretch;
`

const ShowAllProjects = styled(Text).attrs({
  fontSize: [1, 2, 3],
  mb: [3, null, 4],
  color: 'muted'
})`
  cursor: pointer;
`

const ShowAllGrid = styled(Flex).attrs({
  justify: 'center',
  flexDirection: 'row',
  wrap: true,
  mb: 1
})``

class Carousel extends Component {
  state = {
    autoplay: false,
    submitting: false,
    submissionData: {
      liveUrl: '',
      codeUrl: ''
    },
    authed: false,
    authData: {},
    liveFrameStatus: 'empty',
    liveFrameImage: null,
    showAll: false,
    original: this.emptyProject,
    projects: []
  }
  emptyProject = {
    user: { username: '' },
    empty: true,
    live_url: '',
    code_url: '',
    screenshot: {
      id: -1,
      created_at: '',
      updated_at: '',
      type: '',
      file_path: ''
    }
  }

  componentDidMount() {
    const { slug } = this.props

    api.get(`v1/workshops/${slug}/projects`).then(projects => {
      let original = projects.find(
        project => project.user && project.user.username == 'prophetorpheus'
      )
      if (original) {
        remove(projects, original)
        projects.unshift(original)
      } else original = this.emptyProject

      this.setState({
        original,
        projects
      })
    })

    api
      .get(`v1/users/current`)
      .then(authData => {
        console.log(
          `User is authorized! Auth data: ${JSON.stringify(authData)}`
        )
        this.setState({ authed: true, authData })
      })
      .catch(error => {
        console.log(`User is not authorized! Error: ${JSON.stringify(error)}`)
        this.setState({ authed: false, authData: {} })
      })
  }

  setLiveFrameStatus(liveFrameStatus) {
    this.setState({ liveFrameStatus })
  }

  setSubmissionData = submissionData => {
    // Disable "Live Frame" feature for now
    // this.setLiveFrameStatus(submissionData.liveUrl == '' ? 'empty' : 'loading')
    this.setState({ submissionData })
  }

  onClickSubmitButton = () => {
    this.setState({ submitting: true })
  }

  onClickShowAll = () => {
    this.setState({ showAll: !this.state.showAll })
  }

  onSignOut = () => {
    console.log('Signing out')
    this.setState({ authed: false, authData: {} })
  }

  render() {
    const { slug } = this.props
    const {
      original,
      projects,
      submitting,
      submissionData,
      authed,
      authData,
      liveFrameStatus,
      // liveFrameImage,
      showAll
    } = this.state

    const {
      setSubmissionData,
      onClickSubmitButton,
      onClickShowAll,
      onSignOut
    } = this

    const submissionProject = {
      user: authData,
      live_url: submissionData.liveUrl,
      code_url: submissionData.codeUrl,
      screenshot: {}
    }

    const sliderSettings = {
      arrows: false,
      speed: 500,
      autoplay: true,
      initialSlide: 0,
      autoplaySpeed: 5000,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerMode: true,
      pauseOnHover: true,
      variableWidth: true,
      focusOnSelect: true
    }

    const projectCount = projects.length - (original ? 0 : 1)

    return (
      <CarouselOuter>
        <Heading.h3>
          {projectCount} Rehack
          {projectCount != 1 && 's'}
        </Heading.h3>
        <ShowAllProjects onClick={onClickShowAll} mb={[2, 2, 3]}>
          {showAll ? 'ok stack them back up' : 'Show All'}
        </ShowAllProjects>
        {showAll ? (
          <ShowAllGrid>
            {projects.map(project => (
              <CarouselProject
                project={project}
                key={project.screenshot.id}
                m={[1, null, 2]}
              />
            ))}
          </ShowAllGrid>
        ) : liveFrameStatus != 'empty' ? (
          <StaticWrapper>
            <CarouselProject liveFrame project={submissionProject} />
          </StaticWrapper>
        ) : projects.length == 0 ? (
          <StaticWrapper>
            <CarouselProject project={this.emptyProject} />
          </StaticWrapper>
        ) : projects.length < 3 ? (
          <StaticWrapper>
            {projects.map(project => (
              <CarouselProject project={project} key={project.screenshot.id} />
            ))}
          </StaticWrapper>
        ) : (
          <SliderWrapper>
            <RehackSlider {...sliderSettings}>
              {projects.map(project => (
                <CarouselProject
                  project={project}
                  key={project.screenshot.id}
                />
              ))}
            </RehackSlider>
          </SliderWrapper>
        )}

        {submitting ? (
          <CarouselSubmissionForm
            authed={authed}
            authData={authData}
            onSignOut={onSignOut}
            workshopSlug={slug}
            submissionData={submissionData}
            setSubmissionData={setSubmissionData}
          />
        ) : (
          <Button
            px={[3, null, 4]}
            py={[2, null, 3]}
            scale
            fontSize={4}
            onClick={onClickSubmitButton}
          >
            I made something
          </Button>
        )}
      </CarouselOuter>
    )
  }
}

export default Carousel