require File.dirname(__FILE__) + '/../spec_helper.rb'

describe QualityMetric, "creation" do
  elastic_models( Observation, Identification )
  it "should update observation quality_grade" do
    o = make_research_grade_observation
    expect(o.quality_grade).to eq Observation::RESEARCH_GRADE
    qc = QualityMetric.make!(:observation => o, :metric => QualityMetric::METRICS.first, :agree => false)
    o.reload
    expect(o.quality_grade).to eq Observation::CASUAL
  end

  describe "elastic index" do
    before(:all) { DatabaseCleaner.strategy = :truncation }
    after(:all)  { DatabaseCleaner.strategy = :transaction }
    it "should get the updated quality_grade" do
      o = without_delay { make_research_grade_observation }
      o.elastic_index!
      eo = Observation.elastic_search( where: { id: o.id } ).results[0]
      expect( eo.id.to_i ).to eq o.id
      expect( eo.quality_grade ).to eq Observation::RESEARCH_GRADE
      without_delay do
        QualityMetric.make!( observation: o, metric: QualityMetric::METRICS.first, agree: false )
      end
      eo = Observation.elastic_search( where: { id: o.id } ).results[0]
      expect( eo.quality_grade ).to eq Observation::CASUAL
    end
    it "should re-index the observations in the identifications index" do
      o = without_delay { make_research_grade_observation }
      i = o.identifications.first
      o.elastic_index!
      ei = Identification.elastic_search( where: { id: i.id } ).first
      expect( ei.id.to_i ).to eq i.id
      expect( ei.observation.quality_grade ).to eq Observation::RESEARCH_GRADE
      without_delay do
        QualityMetric.make!( observation: o, metric: QualityMetric::METRICS.first, agree: false )
      end
      ei = Identification.elastic_search( where: { id: i.id } ).first
      expect( ei.observation.quality_grade ).to eq Observation::CASUAL
    end
  end
end

describe QualityMetric, "destruction" do
  elastic_models( Observation )
  it "should update observation quality_grade" do
    o = make_research_grade_observation
    expect(o.quality_grade).to eq Observation::RESEARCH_GRADE
    qc = QualityMetric.make!(:observation => o, :metric => QualityMetric::METRICS.first, :agree => false)
    o.reload
    expect(o.quality_grade).to eq Observation::CASUAL
    qc.destroy
    o.reload
    expect(o.quality_grade).to eq Observation::RESEARCH_GRADE
  end
end

describe QualityMetric, "wild" do
  let(:o) { Observation.make! }
  before do
    expect(o).not_to be_captive
  end
  it "should set captive on the observation" do
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => false)
    o.reload
    expect(o).to be_captive
  end

  it "should set captive on the observation to false if majority agree" do
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => false)
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => true)
    o.reload
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => true)
    o.reload
    expect(o).not_to be_captive
  end
  it "should set captive on the observation to true if majority disagree" do
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => false)
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => false)
    o.reload
    QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => true)
    o.reload
    expect(o).to be_captive
  end
  it "should set captive on the observation false if metric destroyed" do
    qm = QualityMetric.make!(:observation => o, :metric => QualityMetric::WILD, :agree => false)
    o.reload
    expect(o).to be_captive
    qm.destroy
    o.reload
    expect(o).not_to be_captive
  end
end
