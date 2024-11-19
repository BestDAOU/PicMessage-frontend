//주소록 및 카테고리 전환 컴포넌트
import React, { useState } from "react";
import { FaTrash, FaChevronUp, FaChevronDown } from "react-icons/fa"; // 화살표 아이콘 추가
import PersonalizationModal from "./PersonalizationModal"; // 모달 컴포넌트 임포트
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 사용
import tonesobj from "../data/tones.json"; // JSON 파일 import

const ContactList = ({
  message,
  setMessage,
  convertedTexts,
  setConvertedTexts,
  selectedContacts,
  setSelectedContacts,
}) => {
  const tones = tonesobj;
  const navigate = useNavigate(); // navigate 훅 선언
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태
  // const [convertedTexts, setConvertedTexts] = useState({}); // 수신자별 메시지 상태
  const [activeTab, setActiveTab] = useState("찐친");
  const [expandedContactId, setExpandedContactId] = useState(null); // 세부사항이 확장된 연락처 ID
  // const [selectedContacts, setSelectedContacts] = useState([]); // 선택된 연락처 목록
  const [isAllChecked, setIsAllChecked] = useState(false); // 전체 선택 상태를 저장하는 변수
  const [isEditing, setIsEditing] = useState(null); // 수정 모드 상태 저장
  const [editData, setEditData] = useState({ tag: "", memo: "", tone: "" });
  const [contacts, setContacts] = useState([
    {
      id: 1,
      profile: "https://via.placeholder.com/40",
      name: "정웅",
      nickname: "대학동기",
      email: "Jung@hansung.ac.kr",
      phone: "010-1111-2222",
      group: "찐친",
      tag: "20학번 동기. 군대 제대함. 여자친구 있음",
      memo: "시험 기간마다 항상 같이 새벽까지 스터디를 했던 친구.",
      tone: tones[0].label,
    },
    {
      id: 2,
      profile: "https://via.placeholder.com/40",
      name: "안예찬",
      nickname: "대학동기",
      email: "Ahn@hansung.ac.kr",
      phone: "010-1111-2222",
      group: "찐친",
      tag: "20학번 동기",
      memo: "친절하고 매사에 성실함",
      tone: tones[1].label,
    },
    {
      id: 3,
      profile: "https://via.placeholder.com/40",
      name: "김소룡",
      nickname: "대학동기",
      email: "Kim@hansung.ac.kr",
      phone: "010-1111-2222",
      group: "찐친",
      tag: "20학번 동기",
      memo: "항상 재밌는 분위기 메이커",
      tone: tones[1].label,
    },
    {
      id: 4,
      profile: "https://via.placeholder.com/40",
      name: "김문권",
      nickname: "대학동기",
      email: "Kim@hansung.ac.kr",
      phone: "010-1111-2222",
      group: "찐친",
      tag: "친절한 사람",
      memo: "항상 웃음 짓는 친구",
      tone: tones[1].label,
    },
    {
      id: 5,
      profile: "https://via.placeholder.com/40",
      name: "임차민",
      nickname: "대학동기",
      email: "Im@hansung.ac.kr",
      phone: "010-1111-2222",
      group: "찐친",
      tag: "농담을 잘함",
      memo: "연락을 자주 하는 친구",
      tone: tones[1].label,
    },
    {
      id: 6,
      profile: "https://via.placeholder.com/40",
      name: "윤단비",
      nickname: "대학동기",
      email: "Yun@hansung.ac.kr",
      phone: "010-1111-2222",
      group: "찐친",
      tag: "조용하고 예의 바름",
      memo: "공부를 열심히 함",
      tone: tones[1].label,
    },
    {
      id: 7,
      profile: "https://via.placeholder.com/40",
      name: "박영수",
      nickname: "동아리원",
      email: "Park@hansung.ac.kr",
      phone: "010-3333-4444",
      group: "동아리",
      tag: "활발한 성격",
      memo: "다양한 취미를 가진 친구",
      tone: tones[1].label,
    },
  ]);

  const generateMessagesForSelectedContacts = () => {
    const texts = selectedContacts.reduce((acc, contact) => {
      acc[contact.id] = convertedTexts[contact.id] || message; // 기존 메시지가 있으면 유지, 없으면 기본 메시지 설정
      return acc;
    }, {});
    setConvertedTexts(texts);
  };

  const openModal = () => {
    if (selectedContacts.length === 0) {
      alert("개인 맞춤화를 위해 하나 이상의 연락처를 선택하세요.");
      return;
    }
    generateMessagesForSelectedContacts();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const filteredContacts = contacts.filter(
    (contact) => contact.group === activeTab
  );
  const 찐친Count = contacts.filter(
    (contact) => contact.group === "찐친"
  ).length;
  const 동아리Count = contacts.filter(
    (contact) => contact.group === "동아리"
  ).length;

  // 체크박스 선택 처리 함수
  const handleCheckboxChange = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId); // 선택된 연락처 찾기

    setSelectedContacts((prevSelected) => {
      const alreadySelected = prevSelected.some(
        (selected) => selected.id === contactId
      );

      if (alreadySelected) {
        // 선택 해제
        const updatedContacts = prevSelected.filter(
          (selected) => selected.id !== contactId
        );
        setConvertedTexts((prevTexts) => {
          const updatedTexts = { ...prevTexts };
          delete updatedTexts[contactId]; // 해당 ID의 메시지 삭제
          return updatedTexts;
        });
        return updatedContacts;
      } else {
        // 선택 추가
        setConvertedTexts((prevTexts) => ({
          ...prevTexts,
          [contact.id]: prevTexts[contact.id] || message, // 기존 메시지가 없으면 기본 메시지 추가
        }));
        return [...prevSelected, contact];
      }
    });
  };

  // 전체 체크박스 선택/해제 처리 함수
  const handleAllCheckboxChange = () => {
    if (isAllChecked) {
      // 모든 선택 해제
      setSelectedContacts([]);
      setConvertedTexts({}); // 모든 메시지 초기화
    } else {
      // 모든 연락처 선택
      const allSelected = filteredContacts.map((contact) => contact);
      setSelectedContacts(allSelected);

      setConvertedTexts((prevTexts) => {
        const newTexts = { ...prevTexts };
        allSelected.forEach((contact) => {
          if (!newTexts[contact.id]) {
            newTexts[contact.id] = message; // 기본 메시지 추가
          }
        });
        return newTexts;
      });
    }
    setIsAllChecked(!isAllChecked); // 상태 반전
  };

  // 선택된 연락처 삭제 함수
  const handleDelete = () => {
    const remainingContacts = contacts.filter(
      (contact) => !selectedContacts.includes(contact.id)
    );
    setContacts(remainingContacts); // 삭제된 연락처 목록으로 상태 업데이트
    setSelectedContacts([]); // 선택된 연락처 목록 초기화
  };

  // 세부사항 토글 함수
  const toggleDetails = (id) => {
    setExpandedContactId(expandedContactId === id ? null : id);
  };

  // 수정 모드로 전환
  const handleEdit = (contact) => {
    setIsEditing(contact.id);
    setEditData({ tag: contact.tag, memo: contact.memo, tone: contact.tone });
  };

  // 수정 완료 후 저장
  const handleSave = (contactId) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId ? { ...contact, ...editData } : contact
    );
    setContacts(updatedContacts);
    setIsEditing(null); // 수정 모드 종료
  };

  // input 값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  // 특정 연락처의 어조 선택 함수
  const handleToneSelection = (tone) => {
    setEditData((prevData) => ({ ...prevData, tone: tone }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>주소록</h2>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("찐친")}
          style={activeTab === "찐친" ? styles.activeTab : styles.tab}
        >
          찐친 ({찐친Count})
        </button>
        <button
          onClick={() => setActiveTab("동아리")}
          style={activeTab === "동아리" ? styles.activeTab : styles.tab}
        >
          동아리 ({동아리Count})
        </button>
      </div>

      <div style={styles.actions}>
        <div style={styles.icons}>
          {/* 전체 선택/해제 체크박스 */}
          <input
            type="checkbox"
            checked={isAllChecked}
            onChange={handleAllCheckboxChange} // 전체 선택 함수 호출
          />
          {/* <input type="checkbox" /> */}
          <button onClick={handleDelete} style={styles.deleteButton}>
            <FaTrash style={styles.icon} /> {/* 휴지통 아이콘 추가 */}
          </button>
        </div>
        <div style={styles.buttonsContainer}>
          {/* 텍스트 개인 맞춤화 버튼에 onClick 이벤트 추가 */}
          <button style={styles.personalizeButton} onClick={openModal}>
            텍스트 개인 맞춤화
          </button>
          {/* 연락처 추가 버튼 */}
          <button
            style={styles.personalizeButton}
            onClick={() => navigate("/contact-form")}
          >
            <span style={styles.plusIcon}>+</span> &nbsp;연락처 추가
          </button>
          {/* <button style={styles.personalizeButton}>
                        <span style={styles.plusIcon}>+</span> &nbsp;연락처 추가
                    </button> */}
        </div>
      </div>
      {/* 모달 컴포넌트 호출 */}
      {isModalOpen && (
        <PersonalizationModal
          selectedContacts={selectedContacts} // 이미 객체 배열 형태
          closeModal={closeModal}
          convertedTexts={convertedTexts}
          setConvertedTexts={setConvertedTexts} // 수신자별 메시지를 업데이트
          onComplete={() => setIsModalOpen(false)} // 완료 후 모달 닫기
        />
      )}

      <div style={styles.contactListContainer}>
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div key={contact.id} style={styles.contactItem}>
              <div style={styles.contactInfo}>
                {/* <input type="checkbox" style={styles.checkbox} /> */}
                <input
                  type="checkbox"
                  checked={selectedContacts.some(
                    (selected) => selected.id === contact.id
                  )}
                  onChange={() => handleCheckboxChange(contact.id)}
                  style={styles.checkbox}
                />
                <img
                  src={contact.profile}
                  alt="Profile"
                  style={styles.profileImage}
                />
                <span style={styles.name}>{contact.name}</span>
                <span style={styles.nickname}>{contact.nickname}</span>
                <span style={styles.email}>{contact.email}</span>
                <span style={styles.phone}>{contact.phone}</span>
                <span style={styles.group}>{contact.group}</span>

                <button
                  onClick={() => toggleDetails(contact.id)}
                  style={styles.detailsButton}
                >
                  {expandedContactId === contact.id ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>
              </div>

              {/* 세부사항 펼쳐지는 부분 */}
              {expandedContactId === contact.id && (
                <div style={styles.detailsContainer}>
                  <div style={styles.detailsHeader}>
                    {isEditing === contact.id ? (
                      <button
                        style={styles.saveButton}
                        onClick={() => handleSave(contact.id)}
                      >
                        저장
                      </button>
                    ) : (
                      <button
                        style={styles.saveButton}
                        onClick={() => handleEdit(contact)}
                      >
                        수정
                      </button>
                    )}
                    <button style={styles.sendRecordButton}>발송 기록</button>
                  </div>
                  {isEditing === contact.id ? (
                    <>
                      <p>
                        <strong>특징:</strong>{" "}
                        <input
                          name="tag"
                          value={editData.tag}
                          onChange={handleInputChange}
                          style={{ width: "500px", height: "30px" }}
                        />
                      </p>
                      <p>
                        <strong>메모:</strong>{" "}
                        <input
                          name="memo"
                          value={editData.memo}
                          onChange={handleInputChange}
                          style={{ width: "500px", height: "30px" }}
                        />
                      </p>
                      <p>
                        <strong>어조 선택:</strong>
                      </p>
                      <div style={styles.toneButtons}>
                        {tones.map((tone) => (
                          <button
                            key={tone.label}
                            onClick={() => handleToneSelection(tone.label)}
                            style={{
                              ...styles.toneButton,
                              backgroundColor:
                                editData.tone === tone.label
                                  ? "#007bff"
                                  : "#ccc",
                              color:
                                editData.tone === tone.label
                                  ? "white"
                                  : "black",
                            }}
                          >
                            {tone.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>특징:</strong> {contact.tag}
                      </p>
                      <p>
                        <strong>메모:</strong> {contact.memo}
                      </p>
                      <p>
                        <strong>어조:</strong> {contact.tone}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={styles.noData}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "10px",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #ccc",
    marginBottom: "10px",
    justifyContent: "center",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#333",
  },
  activeTab: {
    padding: "10px 20px",
    borderBottom: "2px solid #007bff",
    fontWeight: "bold",
    color: "#007bff",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  icons: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    color: "#808080",
    fontSize: "20px",
    marginLeft: "10px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
  },
  buttonsContainer: {
    display: "flex",
    gap: "10px",
  },
  personalizeButton: {
    backgroundColor: "#0086BF",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  plusIcon: {
    fontSize: "18px",
    marginRight: "5px",
  },
  contactListContainer: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
  },
  contactItem: {
    borderBottom: "1px solid #ccc",
    padding: "10px",
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
  },
  profileImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
  },
  name: {
    width: "100px",
    marginRight: "10px",
  },
  nickname: {
    width: "100px",
    marginRight: "10px",
  },
  email: {
    width: "200px",
    marginRight: "10px",
  },
  phone: {
    width: "150px",
    marginRight: "10px",
  },
  group: {
    width: "100px",
    marginRight: "10px",
  },
  detailsButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  detailsContainer: {
    backgroundColor: "#e9f5ff",
    padding: "10px",
    border: "1px solid #007bff",
    borderRadius: "8px",
    marginTop: "10px",
  },
  detailsHeader: {
    display: "flex",
    //justifyContent: 'space-between',
    // justifyContent: 'flet-start',

    marginBottom: "10px",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  sendRecordButton: {
    backgroundColor: "#0086BF",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
  },

  checkbox: {
    marginRight: "10px",
  },
  toneButton: {
    padding: "8px 10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },
};

export default ContactList;
