import React, { useState, useEffect } from "react";
import axios from "axios";
import tonesobj from "../data/tones.json";

const PersonalizationModal = ({
  selectedContacts,
  closeModal,
  convertedTexts,
  setConvertedTexts,
  onComplete,
}) => {
  // 톤 선택 버튼을 렌더링하기 위한 톤 목록
  const tones = tonesobj;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTones, setSelectedTones] = useState({}); // 선택된 톤 상태

  const currentContact = selectedContacts[currentIndex];

  const { tag, memo } = currentContact; // 현재 선택된 연락처의 tag와 memo 가져오기

  // handleToneSelection 함수 추가
  const handleToneSelection = (toneInstruction) => {
    if (currentContact) {
      setSelectedTones((prev) => ({
        ...prev,
        [currentContact.id]: toneInstruction,
      }));
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, selectedContacts.length - 1)
    );
  };
  // 현재 연락처의 기본 선택된 어조 설정
  useEffect(() => {
    if (currentContact) {
      // 이미 선택된 어조가 있으면 유지, 없으면 기본 어조로 초기화
      setSelectedTones((prev) => {
        if (prev[currentContact.id]) return prev; // 기존 선택값 유지
        const defaultTone = tones.find(
          (tone) => tone.label === currentContact.tone
        );
        return {
          ...prev,
          [currentContact.id]: defaultTone
            ? defaultTone.instruction
            : "기본 말투로",
        };
      });
    }
  }, [currentContact, tones]);

  const handleConvert = async () => {
    const textToConvert = convertedTexts[currentContact.id] || "";
    if (!textToConvert) {
      alert("변환할 텍스트를 입력하세요.");
      return;
    }
    const selectedToneInstruction = selectedTones[currentContact.id];
    const selectedToneData = tones.find(
      (tone) => tone.instruction === selectedToneInstruction
    );
    if (!selectedToneData) {
      alert("선택된 톤에 대한 데이터를 찾을 수 없습니다.");
      return;
    }

    const { instruction, examples } = selectedToneData;

    // 모든 예시를 프롬프트에 포함
    const examplesText = examples
      .map((example, index) => `Example ${index + 1}: "${example}"`)
      .join("\n");

    const prompt = `
    Please rewrite the following message in a tone that is described as follows:
    "${instruction}"
    The message should reflect the person's characteristics, notes, and the given examples.
    The response must be written in Korean and should address the recipient by their name.

    Original message: "${textToConvert}"
    Recipient's name: "${currentContact.name}"
    Tags: "${tag}"
    Memo: "${memo}"
    Examples for this tone:
    ${examplesText}
  `;
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      //ContactList의 convertedTexts값 변경
      setConvertedTexts((prev) => ({
        ...prev,
        [currentContact.id]: response.data.choices[0].message.content.trim(),
      }));
    } catch (error) {
      console.error(
        "API 호출 오류:",
        error.response ? error.response.data : error.message
      );
      alert("텍스트 변환에 실패했습니다. 다시 시도해주세요.");
    }
    setLoading(false);
  };

  const handleTextChange = (e) => {
    const { value } = e.target;
    setConvertedTexts((prev) => ({
      ...prev,
      [currentContact.id]: value,
    }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.title}>텍스트 개인 맞춤화</h2>

        {currentContact && (
          <form style={styles.form}>
            <div style={styles.inputGroup}>
              <label>이름:</label>
              <input
                type="text"
                value={currentContact.name}
                readOnly
                style={styles.inputField}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>특징:</label>
              <input
                type="text"
                value={currentContact.tag}
                readOnly
                style={styles.inputField}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>메모:</label>
              <input
                type="text"
                value={currentContact.memo}
                readOnly
                style={styles.inputField}
              />
            </div>

            <div style={styles.toneSelection}>
              <label>어조 선택:</label>
              <div style={styles.toneButtons}>
                {tones.map((tone) => (
                  <button
                    key={tone.label}
                    type="button"
                    style={{
                      ...styles.toneButton,
                      backgroundColor:
                        selectedTones[currentContact.id] === tone.instruction
                          ? "#4A90E2"
                          : "#e1e5f2", // 선택되지 않은 경우 흰색
                      color:
                        selectedTones[currentContact.id] === tone.instruction
                          ? "white"
                          : "black",
                    }}
                    onClick={() => handleToneSelection(tone.instruction)}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.convertSection}>
              <span style={styles.convertLabel}>텍스트 변환</span>
              <button
                type="button"
                style={styles.convertButton}
                onClick={handleConvert}
                disabled={loading}
              >
                {loading ? "변환 중..." : "변환"}
              </button>
            </div>

            <textarea
              style={styles.textArea}
              value={convertedTexts[currentContact.id] || ""}
              onChange={handleTextChange}
              placeholder="여기에 텍스트가 표시됩니다."
            />
          </form>
        )}

        <div style={styles.pagination}>
          <button onClick={() => setCurrentIndex(0)} style={styles.navButton}>
            처음
          </button>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={styles.navButton}
          >
            이전
          </button>
          <span style={styles.pageInfo}>
            {currentIndex + 1} / {selectedContacts.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === selectedContacts.length - 1}
            style={styles.navButton}
          >
            다음
          </button>
          <button
            onClick={() => setCurrentIndex(selectedContacts.length - 1)}
            style={styles.navButton}
          >
            끝
          </button>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={closeModal} style={styles.closeButton}>
            닫기
          </button>
          <button onClick={onComplete} style={styles.completeButton}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
};
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "600px", // 모달창 너비
    height: "600px", // 모달창 높이
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
    overflowY: "auto",
  },
  title: {
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#4A90E2", // 제목 색상
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  inputField: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  toneSelection: {
    marginBottom: "15px",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },
  toneButton: {
    padding: "12px 12px",
    border: "1px solid white",
    borderRadius: "20px",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    color: "black",
  },
  convertSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  convertLabel: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#4A90E2", // 라벨 색상
  },
  convertButton: {
    backgroundColor: "#4A90E2", // 버튼 색상
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  textArea: {
    marginTop: "15px",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    height: "300px", // 입력창 높이
    resize: "none",
    boxSizing: "border-box",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  },
  navButton: {
    backgroundColor: "#4A90E2", // 네비게이션 버튼 색상
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  pageInfo: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#4A90E2", // 페이지 정보 색상
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  closeButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%",
    transition: "background-color 0.3s",
  },
  completeButton: {
    backgroundColor: "#4A90E2", // 완료 버튼 색상
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%",
    transition: "background-color 0.3s",
  },
};

export default PersonalizationModal;
