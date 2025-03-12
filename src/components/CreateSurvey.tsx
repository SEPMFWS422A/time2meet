"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, CircularProgress } from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import CreateMultipleChoiceSurvey, {
  CreateMultipleChoiceSurveyRef,
} from "@/components/CreateMultipleChoiceSurvey";
import CreateScheduling, {
  CreateSchedulingRef,
} from "@/components/CreateScheduling";
import { CheckIcon, CloseIcon } from "@heroui/shared-icons";
import { mergeSurveyData } from "@/lib/SurveyHelpers/SurveyHelper";
import { postSurvey } from "@/lib/api_methods/surveys/postSurvey/surveyPost";
import { ISurveyPostBody } from "@/lib/interfaces/ISurveyPostBody";

const CreateSurvey: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState<{
    text: string;
    status: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [surveyData, setSurveyData] = useState<{
    title: string;
    description: string;
    location: string;
    options: string[];
    status: string;
    participants: string[] | undefined;
  } | null>(null);

  const [schedulingData, setSchedulingData] = useState<{
    dates: { date: Date; times: { start: string; end: string }[] }[];
  } | null>(null);

  const MultipleChoiceSurveyRef = useRef<CreateMultipleChoiceSurveyRef>(null);
  const SchedulingSurveyRef = useRef<CreateSchedulingRef>(null);

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSurveyData = (data: {
    title: string;
    description: string;
    location: string;
    options: string[];
    status: string;
    participants: string[] | undefined;
  }) => {
    setSurveyData(data);
  };

  const handleSchedulingData = (data: {
    dates: { date: Date; times: { start: string; end: string }[] }[];
  }) => {
    setSchedulingData(data);
  };

  useEffect(() => {
    if (surveyData && schedulingData) {

      const mergeData :ISurveyPostBody = mergeSurveyData(surveyData, schedulingData);

      const HandlePostSurvey = async () => {
        setIsLoading(true);
        try {
          const res = await postSurvey(mergeData);
          if (res) {
            if (res.code==201) {
              setPopupMessage({
                text: res.message,
                status: res.status,
              });
              closeModal();
            }

            setPopupMessage({
              text: res.message,
              status: res.status,
            });
            
          }
        } catch (error) {
          console.error("Fehler beim Senden der Daten:", error);
          setPopupMessage({
            text: "Fehler beim Senden der Daten",
            status: "error",
          });
        } finally {
          setIsLoading(false);
        }
      };

      HandlePostSurvey().then();
    }
  }, [surveyData, schedulingData]);

  const getFormData = () => {
    if (MultipleChoiceSurveyRef.current) {
      MultipleChoiceSurveyRef.current.submitForm();
    }
    if (SchedulingSurveyRef.current) {
      SchedulingSurveyRef.current.submitForm();
    }
  };

  return (
    <div
      id="createSurveyButton"
      className="text-center text-white py-4 rounded-t-lg "
    >
      <Button
        className="h-10 text-xl bg-blue-600 text-white"
        onPress={handleOpenModal}
      >
        Umfrage erstellen
      </Button>
      <ModalWindow
        isDismissable={!isLoading}
        size="3xl"
        isOpen={isModalOpen}
        onOpenChange={handleCloseModal}
        content={
          <div className="top-0 relative max-h-screen gap-5 flex flex-col justify-start h-90 ">
            <div className="top-0 relative h-90 flex flex-col md:flex-row justify-around items-center">
              <CreateMultipleChoiceSurvey ref={MultipleChoiceSurveyRef} onSurveyData={handleSurveyData}/>
              <CreateScheduling ref={SchedulingSurveyRef} onSchedulingData={handleSchedulingData}/>
            </div>
            
            <div className="flex flex-row justify-center">
              <Button color="danger" variant="light" onPress={closeModal}>
                <CloseIcon />
                Schließen
              </Button>
              <Button color="primary" onPress={getFormData} isDisabled={isLoading}>
                <CheckIcon />
                Abschicken
              </Button>
              {isLoading && (
                <CircularProgress aria-label="Loading..." color="danger" />
              )}
            </div>
            {popupMessage && (
              <div className="fixed top-4 right-4 z-50">
                <div
                  className={`${
                    popupMessage.status === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                  } rounded-lg shadow-lg p-4`}
                >
                  <p className="text-white">{popupMessage.text}</p>
                </div>
              </div>
            )}

          </div>
        }
        title={"Umfrage erstellen"}
      ></ModalWindow>
                  {popupMessage && (
              <div className="fixed top-4 right-4 z-50">
                <div
                  className={`${
                    popupMessage.status === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                  } rounded-lg shadow-lg p-4`}
                >
                  <p className="text-white">{popupMessage.text}</p>
                </div>
              </div>
            )}
    </div>
  );
};

export default CreateSurvey;
