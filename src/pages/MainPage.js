//src/pages/MainPage.js
import { FiRotateCw } from "react-icons/fi"; // 되돌리기 아이콘
import { AiOutlineClose } from "react-icons/ai"; // 삭제 아이콘

import React, { useState } from "react";
import ContactList from "../components/ContactList";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import axios from "axios";
import { DiFirebase } from "react-icons/di";
import { sendMessages } from "../services/PpurioApiService";
import SendAnimation from "../components/SendAnimation";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 전달된 state에서 메시지와 이미지를 추출
  const messageFromState = location.state?.message || "";
  const [message, setMessage] = useState(messageFromState);
  const [generatedImage, setGeneratedImage] = useState(
    location.state?.generatedImage
  ); // 이미지 상태 관리
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const [prevImage, setPrevImage] = useState(null); // 이전 이미지를 저장

  //const generatedImage = location.state?.generatedImage || null; // Retrieve the generated image URL
  const [convertedTexts, setConvertedTexts] = useState({}); // 수신자별 메시지 상태
  const [selectedContacts, setSelectedContacts] = useState([]); // 선택된 연락처 목록
  const [currentContactIndex, setCurrentContactIndex] = useState(0); //현재 어떤 수신자인지 인덱스 표시
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 메시지에서 키워드를 추출하는 함수
  const extractKeywords = async (message) => {
    try {
      const prompt = `
        Please extract one single keyword in English from the following message that can be used for image generation.

        메시지: ${message}

        키워드:
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an NLP expert. Extract exactly one relevant keyword in English from the provided message that can be used for image generation. The keyword must be concise and relevant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const keywords = response.data.choices[0].message.content.trim();
      return keywords.split(",").map((keyword) => keyword.trim());
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleImageGeneration = async () => {
    if (!message.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }

    try {
      const extractedKeywords = await extractKeywords(message);

      if (extractedKeywords.length === 0) {
        alert("키워드를 추출하지 못했습니다. 메시지를 확인해주세요.");
        return;
      }

      const keyword = extractedKeywords[0];
      console.log("추출된 키워드:", keyword);

      navigate("/image-generation", { state: { message, keyword } });
    } catch (error) {
      console.error("키워드 추출 중 오류 발생:", error);
      alert("키워드 추출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSendButtonClick = async () => {
    const mergedData = mergePhoneAndMessages(); // 데이터 병합 (전화번호, 메시지, 이미지)

    try {
      console.log(
        "Sending data to backend:",
        JSON.stringify(mergedData, null, 2)
      );

      setIsLoading(true); // 전송 상태

      const response = await sendMessages(mergedData); // API 호출
      console.log("서버 응답:", response.data);
      alert("메시지가 성공적으로 전송되었습니다!");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
    setIsLoading(false);
  };

  const mergePhoneAndMessages = () => {
    const mergedData = selectedContacts.map((contact) => {
      const message = convertedTexts[contact.id] || ""; // 선택된 연락처에 해당하는 메시지 내용 가져오기
      const imageBase64 = generatedImage?.split(",")[1] || null; // Base64 데이터만 추출

      // 디버깅: 이미지 데이터 크기 확인
      if (imageBase64) {
        console.log(`Image Base64 Size (before): ${imageBase64.length}`);
        const calculatedSize = Math.floor((imageBase64.length * 3) / 4); // Base64 원본 크기 계산
        console.log(`Calculated Original Size: ${calculatedSize}`);
      }

      return {
        recipientPhoneNumber: contact.phone, // 전화번호
        messageContent: message, // 메시지 내용
        imageBase64: imageBase64, // Base64 데이터 전달
      };
    });

    console.log("Merged Data:", JSON.stringify(mergedData, null, 2)); // 병합된 데이터 확인
    return mergedData;
  };

  return (
    <div style={styles.container}>
      {isLoading && <SendAnimation />}
      <div style={styles.topSection}>
        <img src={logo} alt="service-logo" style={styles.image} />
        <h1>문자 자동생성 서비스</h1>
        <p>
          문자, 이미지 자동생성 서비스를 활용하여 편리하게 메시지를 전송하세요.
        </p>
      </div>

      <div style={styles.row}>
        <div style={styles.section}>
          <div style={styles.labelWithButton}>
            <label style={styles.label}>메시지</label>
            <button
              style={
                isMessageHovered
                  ? { ...styles.messageButton, ...styles.messageButtonHover }
                  : styles.messageButton
              }
              onMouseEnter={() => setIsMessageHovered(true)}
              onMouseLeave={() => setIsMessageHovered(false)}
              onClick={() => navigate("/message-generation")}
            >
              문자 자동생성
            </button>
          </div>
          {selectedContacts.length > 0 ? (
            <>
              {/* 현재 선택된 연락처의 변환된 메시지 표시 */}
              <textarea
                style={styles.textArea}
                value={
                  convertedTexts[selectedContacts[currentContactIndex]?.id] ||
                  message
                }
                onChange={(e) => {
                  const updatedMessage = e.target.value;
                  setConvertedTexts((prev) => ({
                    ...prev,
                    [selectedContacts[currentContactIndex]?.id]: updatedMessage,
                  }));
                }}
              ></textarea>

              {/* 현재 수신자 인덱스 및 이름 표시 */}
              <p style={styles.contactInfo}>
                {`수신자 ${currentContactIndex + 1} / ${
                  selectedContacts.length
                } : ${selectedContacts[currentContactIndex].name}`}
              </p>

              {/* 이전/다음 버튼 */}
              <div style={styles.navigationButtons}>
                <button
                  style={styles.navButton}
                  disabled={currentContactIndex === 0}
                  onClick={() =>
                    setCurrentContactIndex((prevIndex) =>
                      Math.max(prevIndex - 1, 0)
                    )
                  }
                >
                  이전
                </button>
                <button
                  style={styles.navButton}
                  disabled={currentContactIndex === selectedContacts.length - 1}
                  onClick={() =>
                    setCurrentContactIndex((prevIndex) =>
                      Math.min(prevIndex + 1, selectedContacts.length - 1)
                    )
                  }
                >
                  다음
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 선택된 연락처가 없을 경우 기본 메시지 입력 */}
              <textarea
                style={styles.textArea}
                placeholder="메시지를 입력하세요"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.labelWithButton}>
            <label style={styles.label}>이미지</label>
            <button
              style={
                isImageHovered
                  ? { ...styles.imageButton, ...styles.imageButtonHover }
                  : styles.imageButton
              }
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
              onClick={handleImageGeneration}
            >
              이미지 자동생성
            </button>
          </div>
          <div style={styles.imageBox}>
            {generatedImage ? (
              <div style={styles.imageContainer}>
                <img
                  src={generatedImage}
                  alt="Generated"
                  style={{ width: "100%", height: "100%" }}
                />
                <button
                  style={
                    isDeleteButtonHovered
                      ? {
                          ...styles.imageDeleteButton,
                          ...styles.imageDeleteButtonHover,
                        }
                      : styles.imageDeleteButton
                  }
                  onClick={() => {
                    setPrevImage(generatedImage); // 현재 이미지를 이전 이미지로 저장
                    setGeneratedImage(null); // 현재 이미지를 삭제
                  }}
                  onMouseEnter={() => setIsDeleteButtonHovered(true)}
                  onMouseLeave={() => setIsDeleteButtonHovered(false)}
                >
                  <AiOutlineClose size={20} />
                </button>
              </div>
            ) : (
              <>
                {/* 복원 버튼과 텍스트 렌더링 */}
                {prevImage && (
                  <button
                    style={
                      isDeleteButtonHovered
                        ? {
                            ...styles.imageRestoreButton,
                            ...styles.imageRestoreButtonHover,
                          }
                        : styles.imageRestoreButton
                    }
                    onClick={() => {
                      setGeneratedImage(prevImage); // 이전 이미지를 복원
                      setPrevImage(null); // 복원 후 초기화
                    }}
                    onMouseEnter={() => setIsDeleteButtonHovered(true)}
                    onMouseLeave={() => setIsDeleteButtonHovered(false)}
                  >
                    <FiRotateCw size={20} />
                  </button>
                )}
                {/* 박스 중앙에 텍스트 표시 */}
                <p style={styles.imagePlaceholderText}>
                  이미지가 여기에 표시됩니다.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 주소록을 메시지와 이미지 자동생성 바로 아래에 배치 */}
      <div style={styles.contactListSection}>
        <ContactList
          message={message}
          setMessage={setMessage}
          convertedTexts={convertedTexts}
          setConvertedTexts={setConvertedTexts}
          selectedContacts={selectedContacts}
          setSelectedContacts={setSelectedContacts}
        />
        {/* 전송하기 버튼을 주소록 바로 아래에 배치 */}
        <div style={styles.sendButtonContainer}>
          <button style={styles.sendButton} onClick={handleSendButtonClick}>
            전송하기
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {/* <button
          style={styles.chatbotButton}
          onClick={() => navigate("/chatbot")}
        >
          챗봇 사용하기
        </button> */}
      </div>
    </div>
  );
};

const styles = {
  contactName: {
    marginTop: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  contactInfo: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#555",
  },
  // 기존 스타일 정의
  container: {
    margin: "85px",
    backgroundColor: "white",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  topSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  image: {
    width: "100px",
    height: "100px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1200px",
    marginBottom: "40px",
    gap: "20px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    padding: "30px",
    borderRadius: "8px",
    minWidth: "450px",
    boxSizing: "border-box",
    backgroundColor: "#F9FAFB",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  labelWithButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%", // 라벨과 버튼이 같은 섹션에서 정렬되도록
    marginBottom: "10px",
  },
  label: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "black",
    marginRight: "10px", // 버튼과 약간의 간격 추가
  },
  messageButton: {
    background: "#4A90E2",
    color: "white",
    border: "none",
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  messageButtonHover: {
    background: "#007BFF",
    transform: "scale(1.05)",
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)",
  },
  imageButton: {
    background: "linear-gradient(to right, #4A90E2, #007BFF)",
    color: "white",
    border: "none",
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  imageButtonHover: {
    background: "linear-gradient(to right, #007BFF, #4A90E2)",
    transform: "scale(1.1)",
    boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
  },
  textArea: {
    width: "100%",
    height: "400px",
    padding: "20px",
    fontSize: "16px",
    border: "1px solid #4A90E2",
    borderRadius: "8px",
    resize: "none",
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
    color: "#333",
    lineHeight: "1.5",
    outline: "none",
    marginBottom: "10px",
    fontSize: "18px",
    fontFamily: "'Arial', sans-serif", // 폰트 설정
    fontWeight: "bold", // 글씨를 bold로 설정
  },

  imageBox: {
    width: "100%",
    height: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // 중앙 정렬을 위해 추가
    border: "1px solid #4A90E2",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    textAlign: "center",
    marginBottom: "10px",
    boxSizing: "border-box",
    fontSize: "20px",
    color: "#A9A9A9",
    fontFamily: "'Arial', sans-serif", // 폰트 설정
    fontWeight: "bold", //bold로 설정
  },
  chatbotButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "20px 40px",
    fontSize: "20px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "20px",
  },
  contactListSection: {
    width: "1200px",
    maxWidth: "1200px",
  },
  sendButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px", // 전송하기 버튼과 주소록 사이의 간격
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "15px 30px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    width: "200px", // 버튼 크기 지정
    textAlign: "center",
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    gap: "20px", // 버튼 간격 추가
  },
  navButton: {
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  imageDeleteButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(128, 128, 128, 0.7)", // 기본 회색
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    transition: "0.3s ease", // hover 애니메이션 효과
  },
  imageDeleteButtonHover: {
    backgroundColor: "rgba(0, 0, 0, 1)", // 검정색
    transform: "scale(1.2)", // 크기 확대 효과
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.3)", // 그림자 효과 강화
  },
  imageRestoreButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(128, 128, 128, 0.7)", // 기본 회색
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.3s ease", // hover 애니메이션 효과
  },
  imageRestoreButtonHover: {
    backgroundColor: "rgba(0, 0, 0, 1)", // 검정색
    transform: "scale(1.2)", // 크기 확대 효과
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.3)", // 그림자 효과 강화
  },
  imagePlaceholderText: {
    fontSize: "18px",
    color: "#A9A9A9",
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)", // 텍스트를 박스 중앙에 배치
    pointerEvents: "none", // 클릭 불가
  },
};

export default MainPage;
